const pageSize = 10;
let employees = [], departments = [], locations = [];
let currentPage = 1;

$(function () {
  initApp();

  // Sidebar navigation logic
  function showSection(section) {
    $('#section-staff, #section-dept, #section-loc').addClass('d-none');
    $('#nav-staff, #nav-dept, #nav-loc').removeClass('active');
    if (section === 'staff') {
      $('#section-staff').removeClass('d-none');
      $('#nav-staff').addClass('active');
    } else if (section === 'dept') {
      $('#section-dept').removeClass('d-none');
      $('#nav-dept').addClass('active');
      loadDepartments();
    } else if (section === 'loc') {
      $('#section-loc').removeClass('d-none');
      $('#nav-loc').addClass('active');
      loadLocations();
    }
  }
  $('#nav-staff').click(function() { showSection('staff'); });
  $('#nav-dept').click(function() { showSection('dept'); });
  $('#nav-loc').click(function() { showSection('loc'); });

  // Show staff by default on page load
  showSection('staff');

  // Filters
  $('#searchBox').on('input', function () {
    currentPage = 1;
    renderTable();
  });

  $('#filterDept, #filterLoc').on('change', function () {
    currentPage = 1;
    renderTable();
  });

  // Pagination
  $(document).on('click', '#pagination .page-link', function (e) {
    e.preventDefault();
    const page = parseInt($(this).data('page'));
    if (page && page !== currentPage) {
      currentPage = page;
      renderTable();
    }
  });

  // Add Personnel Modal (Add)
  $('#addPersonnelModal').on('show.bs.modal', function () {
    resetPersonnelForm();
    $('#addPersonnelLabel').text('Add Employee');
    fillDepartmentDropdown('#departmentSelect');
    fillLocationDropdown('#locationSelect');
  });

  // ADD DEPARTMENT
  $('#addDepartmentForm').on('submit', function(e) {
    e.preventDefault();
    const btn = $(this).find('button[type="submit"]');
    btn.prop('disabled', true).text('Saving...');
    $.post('../php/insertDepartment.php', $(this).serialize())
      .done(resp => {
        btn.prop('disabled', false).text('Add');
        if (resp.status.code === "200") {
          $('#addDepartmentModal').modal('hide');
          reloadDepartments();
        } else {
          alert(resp.status.description || "Failed to add department.");
        }
      })
      .fail(() => {
        btn.prop('disabled', false).text('Add');
        alert('Request failed.');
      });
  });

  // ADD LOCATION
  $('#addLocationForm').on('submit', function(e) {
    e.preventDefault();
    const btn = $(this).find('button[type="submit"]');
    btn.prop('disabled', true).text('Saving...');
    $.post('../php/insertLocation.php', $(this).serialize())
      .done(resp => {
        btn.prop('disabled', false).text('Add');
        if (resp.status.code === "200") {
          $('#addLocationModal').modal('hide');
          reloadLocations();
        } else {
          alert(resp.status.description || "Failed to add location.");
        }
      })
      .fail(() => {
        btn.prop('disabled', false).text('Add');
        alert('Request failed.');
      });
  });

  // Edit Personnel Modal 
  $(document).on('click', '.edit-btn', function (e) {
    e.preventDefault();
    const id = $(this).data('id');
    const entity = $(this).data('entity');
    if (entity === "department") {
      editDepartment(id);
      return;
    }
    if (entity === "location") {
      editLocation(id);
      return;
    }
    if (typeof entity === "undefined" && id) {
      openEditPersonnelModal(id);
    }
  });

  // Edit from profile modal
  $(document).on('click', '.profile-edit-btn', function(){
    const id = $(this).data('id');
    if (id) openEditPersonnelModal(id);
  });

  // Profile view
  $(document).on('click', '.profile-btn', function (e) {
    e.preventDefault();
    const id = $(this).data('id');
    if (id) {
      showProfile(id);
    }
  });

  // Delete button 
  $(document).on('click', '.delete-btn', function (e) {
    e.preventDefault();
    const id = $(this).data('id');
    const entity = $(this).data('entity');
    if (entity === "department") {
      confirmDeleteDepartment(id);
      return;
    }
    if (entity === "location") {
      confirmDeleteLocation(id);
      return;
    }
    if ((typeof entity === "undefined" || entity === "staff") && id) {
      const emp = employees.find(e => e.id == id);
      if (emp) {
        $('#confirmDeleteBody').html(`Are you sure you want to delete <strong>${emp.firstName} ${emp.lastName}</strong>?`);
        $('#deleteConfirmBtn').data('id', id).data('entity', 'staff');
        $('#confirmDeleteModal').modal('show');
      }
    }
  });

  // Department Edit
  $(document).on('click', '.edit-department-btn', function(e) {
    e.preventDefault();
    const id = $(this).data('id');
    editDepartment(id);
  });
  function editDepartment(id) {
    const dept = departments.find(d => d.id == id);
    if (!dept) return;
    $('#editDepartmentId').val(dept.id);
    $('#editDepartmentName').val(dept.name);
    fillLocationDropdown('#editDepartmentLocationSelect');
    $('#editDepartmentLocationSelect').val(dept.locationID);
    $('#editDepartmentModal').modal('show');
  }

  $(document).on('submit', '#editDepartmentForm', function(e) {
    e.preventDefault();
    const btn = $(this).find('button[type="submit"]');
    btn.prop('disabled', true).text('Saving...');
    $.post('../php/updateDepartment.php', $(this).serialize())
      .done(result => {
        btn.prop('disabled', false).text('Save');
        if (result.status.code === "200") {
          $('#editDepartmentModal').modal('hide');
          reloadDepartments();
        } else {
          alert('Failed to update department: ' + result.status.description);
        }
      })
      .fail(() => alert('Department update failed.'));
  });

  // Location Edit
  $(document).on('click', '.edit-location-btn', function(e) {
    e.preventDefault();
    const id = $(this).data('id');
    editLocation(id);
  });
  function editLocation(id) {
    const loc = locations.find(l => l.id == id);
    if (!loc) return;
    $('#editLocationId').val(loc.id);
    $('#editLocationName').val(loc.name);
    $('#editLocationModal').modal('show');
  }

  $(document).on('submit', '#editLocationForm', function(e) {
    e.preventDefault();
    const btn = $(this).find('button[type="submit"]');
    btn.prop('disabled', true).text('Saving...');
    $.post('../php/updateLocation.php', $(this).serialize())
      .done(result => {
        btn.prop('disabled', false).text('Save');
        if (result.status.code === "200") {
          $('#editLocationModal').modal('hide');
          reloadLocations();
        } else {
          alert('Failed to update location: ' + result.status.description);
        }
      })
      .fail(() => alert('Location update failed.'));
  });

  // Delete department/location 
  $(document).on('click', '.delete-department-btn', function(e) {
    e.preventDefault();
    const id = $(this).data('id');
    confirmDeleteDepartment(id);
  });
  $(document).on('click', '.delete-location-btn', function(e) {
    e.preventDefault();
    const id = $(this).data('id');
    confirmDeleteLocation(id);
  });

  // Delete confirmation
  $(document).on('click', '#deleteConfirmBtn', function () {
    const id = $(this).data('id');
    const entity = $(this).data('entity');
    if (id && entity === 'staff') {
      deletePersonnel(id);
      $('#confirmDeleteModal').modal('hide');
    } else if (id && entity === 'department') {
      deleteDepartment(id);
      $('#confirmDeleteModal').modal('hide');
    } else if (id && entity === 'location') {
      deleteLocation(id);
      $('#confirmDeleteModal').modal('hide');
    }
  });

  // ADD Personnel Form
  $('#personnelForm').submit(function (e) {
    e.preventDefault();
    const btn = $(this).find('button[type="submit"]');
    btn.prop('disabled', true).text('Saving...');
    const id = $('#personnelId').val();
    const url = id ? '../php/updatePersonnel.php' : '../php/insertPersonnel.php';

    $.post(url, $(this).serialize())
      .done(resp => {
        btn.prop('disabled', false).text('Save');
        if (resp.status.code === "200") {
          $('#addPersonnelModal').modal('hide');
          loadAll();
        } else {
          alert('Error: ' + resp.status.description);
        }
      })
      .fail(() => {
        btn.prop('disabled', false).text('Save');
        alert('Request failed.');
      });
  });

  // EDIT personnel modal
  $(document).on('submit', '#editPersonnelForm', function(e) {
    e.preventDefault();
    const btn = $(this).find('button[type="submit"]');
    btn.prop('disabled', true).text('Saving...');
    $.post('../php/updatePersonnel.php', $(this).serialize())
      .done(resp => {
        btn.prop('disabled', false).text('Save');
        if (resp.status.code === "200") {
          $('#editPersonnelModal').modal('hide');
          loadAll();
        } else {
          alert('Failed to update employee: ' + resp.status.description);
        }
      })
      .fail(() => {
        btn.prop('disabled', false).text('Save');
        alert('Request failed.');
      });
  });
});

function initApp() {
  $.when(
    $.getJSON('../php/getAllDepartments.php').done(resp => {
      departments = resp.data || [];
    }),
    $.getJSON('../php/getAllLocations.php').done(resp => {
      locations = resp.data || [];
    })
  ).then(() => {
    fillDeptFilter();
    fillLocFilter();
    fillDepartmentDropdown('#departmentSelect');
    fillLocationDropdown('#departmentLocationSelect');
    fillLocationDropdown('#locationSelect');
    loadAll();
    reloadDepartments();
    reloadLocations();
  }).fail(() => {
    alert('Initial load failed.');
  });
}

function reloadDepartments() {
  $.getJSON('../php/getAllDepartments.php').done(data => {
    departments = data.data || [];
    fillDeptFilter();
    fillDepartmentDropdown('#departmentSelect');
    loadDepartments();
    loadAll();
    $('#total-departments').text(departments.length);
  });
}

function reloadLocations() {
  $.getJSON('../php/getAllLocations.php').done(data => {
    locations = data.data || [];
    fillLocFilter();
    fillLocationDropdown('#departmentLocationSelect');
    fillLocationDropdown('#locationSelect');
    loadLocations();
    loadAll();
    $('#total-locations').text(locations.length);
  });
}

function loadAll() {
  $.getJSON('../php/getAll.php')
    .done(resp => {
      employees = resp.data || [];
      employees.forEach(emp => {
        if (!emp.departmentID) {
          const dept = departments.find(d => d.name === emp.department);
          emp.departmentID = dept ? dept.id : "";
        }
        if (!emp.locationID) {
          const loc = locations.find(l => l.name === emp.location);
          emp.locationID = loc ? loc.id : "";
        }
      });
      $('#total-employees').text(employees.length);
      renderTable();
    })
    .fail(() => {
      alert('Failed to load employees.');
    });
}
function loadDepartments() {
  $('#departmentsTable tbody').html('');
  departments.forEach(dept => {
    const locName = locations.find(loc => loc.id == dept.locationID)?.name || '';
    const empCount = employees.filter(emp => emp.departmentID == dept.id).length;
    $('#departmentsTable tbody').append(`
      <tr>
        <td>${dept.name}</td>
        <td>${locName}</td>
        <td>${empCount}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-warning edit-department-btn" data-id="${dept.id}" data-entity="department"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger delete-department-btn" data-id="${dept.id}" data-entity="department"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`);
  });
}

function loadLocations() {
  $('#locationsTable tbody').html('');
  locations.forEach(loc => {
    const deptCount = departments.filter(dept => dept.locationID == loc.id).length;
    const empCount = employees.filter(emp => emp.locationID == loc.id).length;
    $('#locationsTable tbody').append(`
      <tr>
        <td>${loc.name}</td>
        <td>${deptCount}</td>
        <td>${empCount}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-warning edit-location-btn" data-id="${loc.id}" data-entity="location"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger delete-location-btn" data-id="${loc.id}" data-entity="location"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`);
  });
}

function renderTable() {
  const search = $('#searchBox').val().toLowerCase().trim();
  const dept = $('#filterDept').val();
  const loc = $('#filterLoc').val();

  let filtered = employees.filter(emp => {
    const searchFields = [
      emp.firstName || '',
      emp.lastName || '',
      emp.department || '',
      emp.email || ''
    ];

    const matchSearch = search === '' || searchFields.some(field =>
      field.toLowerCase().includes(search)
    );
    const matchDept = !dept || dept === '' || dept === 'all' || String(emp.departmentID) === String(dept);
    const matchLoc = !loc || loc === '' || loc === 'all' || String(emp.locationID) === String(loc);

    return matchSearch && matchDept && matchLoc;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  let rows = '';
  if (pageData.length === 0) {
    rows = '<tr><td colspan="5" class="text-center">No employees found</td></tr>';
  } else {
    pageData.forEach(emp => {
      const firstInitial = emp.firstName ? emp.firstName[0] : '?';
      const lastInitial = emp.lastName ? emp.lastName[0] : '?';
      rows += `
        <tr>
          <td>
         <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width:40px;height:40px;font-weight:700;font-size:1.1em;">
  ${firstInitial}${lastInitial}
</div>
          </td>
          <td>
            <button class="btn btn-link profile-btn p-0" data-id="${emp.id}">${emp.firstName || ''} ${emp.lastName || ''}</button>
          </td>
          <td>${emp.department || ''}</td>
          <td>${emp.location || ''}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-warning edit-btn" data-id="${emp.id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${emp.id}"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `;
    });
  }

  $('#personnelTable tbody').html(rows);
  renderPagination(totalPages);
  updateResultsCount(filtered.length, employees.length);
}

function renderPagination(totalPages) {
  let html = '';
  if (currentPage > 1) {
    html += `<li class="page-item">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>`;
  }
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item${i === currentPage ? ' active' : ''}">
      <a class="page-link" href="#" data-page="${i}">${i}</a>
    </li>`;
  }
  if (currentPage < totalPages) {
    html += `<li class="page-item">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`;
  }
  $('#pagination').html(html);
}

function updateResultsCount(filtered, total) {
  const countText = filtered === total ?
    `Showing ${total} employees` :
    `Showing ${filtered} of ${total} employees`;
  if ($('#resultsCount').length === 0) {
    $('#personnelTable').before(`<div id="resultsCount" class="mb-2 text-muted small">${countText}</div>`);
  } else {
    $('#resultsCount').text(countText);
  }
}

function fillDeptFilter() {
  let options = `<option value="">All Departments</option>`;
  departments.forEach(d => {
    options += `<option value="${d.id}">${d.name}</option>`;
  });
  $('#filterDept').html(options);
  fillDepartmentDropdown('#departmentSelect');
}

function fillLocFilter() {
  let options = `<option value="">All Locations</option>`;
  locations.forEach(l => {
    options += `<option value="${l.id}">${l.name}</option>`;
  });
  $('#filterLoc').html(options);
  fillLocationDropdown('#locationSelect');
}

function fillDepartmentDropdown(selector) {
  let opts = '';
  departments.forEach(d => {
    opts += `<option value="${d.id}">${d.name}</option>`;
  });
  $(selector).html(opts);
}

function fillLocationDropdown(selector) {
  let opts = '';
  locations.forEach(loc => {
    opts += `<option value="${loc.id}">${loc.name}</option>`;
  });
  $(selector).html(opts);
}

function openEditPersonnelModal(id) {
  const emp = employees.find(e => e.id == id);
  if (!emp) {
    return;
  }
  $('#editPersonnelId').val(emp.id);
  $('#editPersonnelFirstName').val(emp.firstName || '');
  $('#editPersonnelLastName').val(emp.lastName || '');
  $('#editPersonnelEmail').val(emp.email || '');
  let deptOpts = '';
  departments.forEach(d => {
    deptOpts += `<option value="${d.id}"${String(d.id) === String(emp.departmentID) ? ' selected' : ''}>${d.name}</option>`;
  });
  $('#editPersonnelDepartmentSelect').html(deptOpts);
  let locOpts = '';
  locations.forEach(l => {
    locOpts += `<option value="${l.id}"${String(l.id) === String(emp.locationID) ? ' selected' : ''}>${l.name}</option>`;
  });
  $('#editPersonnelLocationSelect').html(locOpts);

  $('#editPersonnelModal').modal('show');
}

function resetPersonnelForm() {
  $('#personnelForm')[0].reset();
  $('#personnelId').val('');
  $('#addPersonnelLabel').text('Add Employee');
  $('#personnelForm .is-invalid, #personnelForm .is-valid').removeClass('is-invalid is-valid');
}

function showProfile(id) {
  const emp = employees.find(e => e.id == id);
  if (!emp) return;

  const firstInitial = emp.firstName ? emp.firstName[0] : '?';
  const lastInitial = emp.lastName ? emp.lastName[0] : '?';

  $('#profileContent').html(`
    <div class="modal-header">
      <h5 class="modal-title">${emp.firstName || ''} ${emp.lastName || ''}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body row">
      <div class="col-md-4 text-center">
    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto" style="width:72px;height:72px;font-size:2rem;font-weight:700;">
  ${firstInitial}${lastInitial}
</div>
        <p class="mt-3 mb-0"></p>
        <p class="mb-0"><small>${emp.email || ''}</small></p>
      </div>
      <div class="col-md-8">
        <p><strong>Department:</strong> ${emp.department || ''}</p>
        <p><strong>Location:</strong> ${emp.location || ''}</p>
        <button class="btn btn-warning profile-edit-btn" data-id="${emp.id}" data-bs-dismiss="modal">Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${emp.id}" data-bs-dismiss="modal">Delete</button>
      </div>
    </div>`);
  $('#profileModal').modal('show');
}

function confirmDeleteDepartment(id) {
  const dept = departments.find(d => d.id == id);
  if (dept) {
    $('#confirmDeleteBody').html(`Are you sure you want to delete <strong>${dept.name}</strong>?`);
    $('#deleteConfirmBtn').data('id', id).data('entity', 'department');
    $('#confirmDeleteModal').modal('show');
  }
}

function confirmDeleteLocation(id) {
  const loc = locations.find(l => l.id == id);
  if (loc) {
    $('#confirmDeleteBody').html(`Are you sure you want to delete <strong>${loc.name}</strong>?`);
    $('#deleteConfirmBtn').data('id', id).data('entity', 'location');
    $('#confirmDeleteModal').modal('show');
  }
}

function deleteDepartment(id) {
  $.post('../php/deleteDepartment.php', { id })
    .done(resp => {
      if (resp.status.code === "200") {
        reloadDepartments();
      } else {
        alert('Error: ' + resp.status.description);
      }
    })
    .fail(() => {
      alert('Delete failed.');
    });
}
function deleteLocation(id) {
  $.post('../php/deleteLocation.php', { id })
    .done(resp => {
      if (resp.status.code === "200") {
        reloadLocations();
      } else {
        alert('Error: ' + resp.status.description);
      }
    })
    .fail(() => {
      alert('Delete failed.');
    });
}

function deletePersonnel(id) {
  if (!id || isNaN(Number(id))) {
    alert('Invalid personnel ID for deletion: ' + id);
    return;
  }
  $.post('../php/deletePersonnel.php', { id })
    .done(resp => {
      if (resp.status.code === "200") {
        loadAll();
      } else {
        alert('Error: ' + resp.status.description);
      }
    })
    .fail(() => {
      alert('Delete failed.');
    });
}
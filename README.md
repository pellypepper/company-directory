# Company Directory - Professional Employee Management

A modern, responsive employee management system built with Bootstrap 5, jQuery, and PHP.  
This project allows organizations to manage their staff, departments, and locations efficiently via a user-friendly web interface.

Live Demo :  https://pelumi.fwh.is/

## Features

- **Staff Directory:** Add, edit, view, and delete employee records. Filter and search employees by name, department, or location.
- **Departments Management:** Create, edit, and remove departments; assign departments to locations.
- **Locations Management:** Add, edit, and delete company locations.
- **Statistics Dashboard:** View company stats and analytics at a glance (expandable).
- **Responsive Design:** Works seamlessly on desktop and mobile devices.
- **Professional UI:** Clean, modern interface using Bootstrap 5 and Bootstrap Icons.

## Screenshots

![Employee Directory Screenshot]<img width="1920" height="1112" alt="screencapture-pelumi-fwh-is-2025-07-10-15_11_30" src="https://github.com/user-attachments/assets/d0c49866-a64f-42e2-b7ae-2e4934c6b446" />

![Add/Edit Employee Modal]<img width="1920" height="945" alt="screencapture-pelumi-fwh-is-2025-07-10-15_13_33" src="https://github.com/user-attachments/assets/99986b32-5208-4ef6-badd-b36a2f0a2cdb" />


## Tech Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5, jQuery, Bootstrap Icons
- **Backend:** PHP (with MySQLi)
- **Database:** MySQL/MariaDB

## Getting Started

### Prerequisites

- PHP 7.4+ (with MySQLi enabled)
- MySQL or MariaDB
- Web server (e.g., Apache, Nginx)
- [Composer](https://getcomposer.org/) (optional, for future enhancements)
- [Node.js and npm](https://nodejs.org/) (optional, for future frontend tooling)

### Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/company-directory.git
    cd company-directory
    ```

2. **Database Setup**
    - Import the provided `database.sql` file into your MySQL/MariaDB server:
      ```bash
      mysql -u youruser -p yourdb < database.sql
      ```
    - Update the `php/config.php` file with your database credentials.

3. **Configure your web server**
    - Ensure your document root points to the project directory.
    - Make sure the `php/` directory is accessible for AJAX requests.

4. **(Optional) Install dependencies**
    - For additional features, you may run:
      ```bash
      npm install
      ```

5. **Access the application**
    - Open your browser and navigate to `http://localhost/` (or your configured domain/path).

## File Structure

```
.
├── css/
│   └── index.css
├── js/
│   └── index.js
├── php/
│   ├── config.php
│   ├── getAll.php
│   ├── insertPersonnel.php
│   ├── updatePersonnel.php
│   ├── deletePersonnel.php
│   ├── getAllDepartments.php
│   ├── insertDepartment.php
│   ├── updateDepartment.php
│   ├── deleteDepartment.php
│   ├── getAllLocations.php
│   ├── insertLocation.php
│   ├── updateLocation.php
│   ├── deleteLocation.php
│   └── ...
├── index.html
├── README.md
└── database.sql
```


## License

This project is licensed under the [MIT License](LICENSE).

## Credits

- [Bootstrap](https://getbootstrap.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [jQuery](https://jquery.com/)

---

**Need help?**  
Open an issue in this repository or contact the maintainer.

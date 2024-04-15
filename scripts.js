var students = [];

// Load student data from localStorage on page load
window.addEventListener('load', function() {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
        students = JSON.parse(storedStudents);
        showTable();
    }
});

function addStudent() {
    const nameValue = document.getElementById('name').value;
    const regNumberValue = document.getElementById('regNumber').value;
    const emailValue = document.getElementById('email').value;

    // Check if any of the fields are empty
    if (nameValue === '' || regNumberValue === '' || emailValue === '') {
        alert("All fields are required!");
        return;
    }

    // Create a new student object
    const newStudent = {
        ID: students.length + 1, // Generate ID based on array length
        Name: nameValue,
        'Register Number': regNumberValue,
        Email: emailValue,
        Attendance: [], // Initialize Attendance array for each student
        Marks: {} // Initialize Marks object for each student
    };

    // Add the new student to the students array
    students.push(newStudent);

    // Save students data to localStorage
    saveToLocalStorage();

    // Clear input fields
    document.getElementById('name').value = "";
    document.getElementById('regNumber').value = "";
    document.getElementById('email').value = "";

    // Call the showTable() function to update the table
    showTable();
}

function showTable() {
    const headers = ['ID', 'Name', 'Register Number', 'Email', 'Attendance', 'Add Attendance', 'OOSE', 'DevOps', 'PPL', 'WAS', 'UI/UX', 'ESIOT', 'EVsIA', 'Add Marks', 'Edit/Delete'];
    const tableBody = document.getElementById('tbody');
    tableBody.innerHTML = "";

    students.forEach(student => {
        const row = document.createElement("tr");

        headers.forEach(header => {
            const cell = document.createElement('td');

            if (header === 'Attendance') {
                cell.innerHTML = student[header] ? student[header].map(entry => `${entry.date}: ${entry.status}`).join('<br>') : '';
            } else if (header === 'Add Attendance') {
                cell.innerHTML = `<button onclick="addAttendance(${student.ID})">Add</button>`;
            } else if (header === 'OOSE' || header === 'DevOps' || header === 'PPL' || header === 'WAS' || header === 'UI/UX' || header === 'ESIOT' || header === 'EVsIA') {
                cell.innerHTML = student['Marks'][header] !== undefined ? student['Marks'][header] : '';
            } else if (header === 'Add Marks') {
                cell.innerHTML = `<button onclick="addMarks(${student.ID})">Add</button>`;
            } else {
                cell.innerHTML = student[header] !== undefined ? student[header] : '';
            }

            row.appendChild(cell);
        });

        // Create edit and delete buttons
        const editBtn = createButton('Edit', () => edit(student['ID']));
        const deleteBtn = createButton('Delete', () => del(student['ID']));

        // Create cell for edit and delete buttons
        const buttonCell = document.createElement('td');
        buttonCell.classList.add('edit-delete-column');
        buttonCell.appendChild(editBtn);
        buttonCell.appendChild(deleteBtn);

        // Append the button cell to the last column of the row
        row.appendChild(buttonCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

function createButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    return btn;
}

function edit(id) {
    const studentIndex = students.findIndex(student => student.ID === id);
    if (studentIndex !== -1) {
        const student = students[studentIndex];
        document.querySelector("#name").value = student['Name'];
        document.querySelector("#regNumber").value = student['Register Number'];
        document.querySelector("#email").value = student['Email'];
        const editBtn = document.getElementById("edit-btn");
        if (editBtn.style.display !== "none") {
            document.getElementById("submit").textContent = "Edit Student";
        }
        localStorage.setItem('editedStudentID', id); // Store the ID of the edited student
    } else {
        alert("Student not found!");
    }
}

function del(id) {
    const index = students.findIndex(student => student.ID === id);
    if (index !== -1) {
        students.splice(index, 1);
        saveToLocalStorage(); // Save changes to localStorage
        showTable();
    } else {
        alert("Student not found!");
    }
}

function deleteAllStudents() {
    const confirmation = confirm("Are you sure you want to delete all student data?");
    if (confirmation) {
        students = []; // Clear the students array
        localStorage.removeItem('students'); // Remove students data from localStorage
        showTable(); // Update the table
    }
}

function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

function importStudents() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const importedStudents = XLSX.utils.sheet_to_json(sheet);

            // Reset the students array to clear any existing data
            students = [];

            // Loop through the imported data and add it to the students array
            importedStudents.forEach(importedStudent => {
                const newStudent = {
                    ID: students.length + 1,
                    Name: importedStudent.Name,
                    'Register Number': importedStudent['Register Number'],
                    Email: importedStudent.Email,
                    Attendance: [], // Initialize Attendance array for each student
                    Marks: {} // Initialize Marks object for each student
                };
                students.push(newStudent);
            });

            // Save imported students to localStorage
            saveToLocalStorage();

            // Update the table with imported data
            showTable();
        };
        reader.readAsArrayBuffer(file);
    }
}

function downloadRecords() {
    const headers = ['ID', 'Name', 'Register Number', 'Email', 'Attendance', 'OOSE', 'DevOps', 'PPL', 'WAS', 'UI/UX', 'ESIOT', 'EVsIA'];
    const rows = students.map(student => {
        const attendance = student['Attendance'] ? student['Attendance'].map(entry => `${entry.date}: ${entry.status}`).join('\n') : '';
        const rowData = [
            student['ID'],
            student['Name'],
            student['Register Number'],
            student['Email'],
            attendance,
            student['Marks'] ? student['Marks']['OOSE'] || '' : '',
            student['Marks'] ? student['Marks']['DevOps'] || '' : '',
            student['Marks'] ? student['Marks']['PPL'] || '' : '',
            student['Marks'] ? student['Marks']['WAS'] || '' : '',
            student['Marks'] ? student['Marks']['UI/UX'] || '' : '',
            student['Marks'] ? student['Marks']['ESIOT'] || '' : '',
            student['Marks'] ? student['Marks']['EVsIA'] || '' : ''
        ];
        return rowData.join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "studentdata.csv");
    document.body.appendChild(link);
    link.click();
}

function addAttendance(id) {
    const student = students.find(student => student.ID === id);
    if (student) {
        const attendanceDate = document.getElementById('edit-attendance-date').value;
        const attendanceStatus = document.getElementById('edit-attendance-status').value;

        if (attendanceDate && attendanceStatus) {
            student.Attendance.push({ date: attendanceDate, status: attendanceStatus });
            saveToLocalStorage(); // Save changes to localStorage
            showTable(); // Update the table after adding attendance
        } else {
            alert("Please select both date and status.");
        }
    } else {
        alert("Student not found!");
    }
}

function addMarks(id) {
    const student = students.find(student => student.ID === id);
    if (student) {
        const ooseMarks = document.getElementById('edit-oose-marks').value;
        const devOpsMarks = document.getElementById('edit-devops-marks').value;
        const pplMarks = document.getElementById('edit-ppl-marks').value;
        const wasMarks = document.getElementById('edit-was-marks').value;
        const uiuxMarks = document.getElementById('edit-uiux-marks').value;
        const esiotMarks = document.getElementById('edit-esiot-marks').value;
        const evsiaMarks = document.getElementById('edit-evsia-marks').value;

        student.Marks = {
            'OOSE': ooseMarks,
            'DevOps': devOpsMarks,
            'PPL': pplMarks,
            'WAS': wasMarks,
            'UI/UX': uiuxMarks,
            'ESIOT': esiotMarks,
            'EVsIA': evsiaMarks
        };
        saveToLocalStorage(); // Save changes to localStorage
        showTable(); // Update the table after adding marks
    } else {
        alert("Student not found!");
    }
}


const express = require('express');
const session = require('express-session');
const path = require('path'); // Add this line to import the path module

const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');




const cors = require('cors');


// MySQL connection configuration
const db = mysql.createConnection({
   host: 'localhost',
   user: 'root',         // Your MySQL username
    password: 'copa123',         // Your MySQL password
   database: 'project' // The name of your database
});







// Connect to MySQL database
db.connect(function(err) {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

const app = express();
const port = 3000;
// Middleware to parse form data (URL-encoded)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors()); // Enable CORS


app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on http://0.0.0.0:3000');
});



// Middleware to handle CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});




// Session middleware
app.use(session({
    secret: 'yourSecretKey', // Secret to sign the session ID
    resave: false,            // Don't save session if unmodified
    saveUninitialized: true,  // Save session even if not modified
    cookie: { secure: false } // Set to true if using HTTPS
}));




// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));


// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'loginregistraionforcustomer.html'));  // Serve login page from the "public" folder
});

// CONTACT FORM DATA Handle form submission and insert data into MySQL 
app.post('/insert', (req, res) => {
    const { name, email, message } = req.body;

    // SQL query to insert data into the users table
    const sql = 'INSERT INTO users (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err.stack);
            return res.status(500).send('Error inserting data');
        }
      res.send('User data inserted successfully');
    });

});
//CUSTOMER REGISTRATION
app.post('/customer', (req, res) => {
  const { name, mobile_number, gender, address, password, confirm_password } = req.body;

  // Check if passwords match
  if (password !== confirm_password) {
    return res.status(400).send('Passwords do not match');
  }

  // Insert the new user into the database with the plain-text password (no hashing)
  const query = 'INSERT INTO customers (name, mobile_number, gender, address, password) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, mobile_number, gender, address, password], (err, result) => {
    if (err) {
      console.error('Error inserting user into database:', err);
      return res.status(500).send('Error registering user');
    }
    //res.send('Registration successful');
	
  });
});

// CUSTOMERS LOGIN
// POST route for handling login requests


app.post('/logincus', (req, res) => {
  const { mobile_number, password } = req.body;

  // Log the incoming data for debugging
  console.log('Mobile Number:', mobile_number);
  console.log('Password:', password);

  if (!mobile_number || !password) {
    return res.send('Mobile number and password are required');
  }

  const query = 'SELECT * FROM customers WHERE mobile_number = ?';
  db.query(query, [mobile_number], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      const user = results[0];
      console.log('Stored Password:', user.password);

      // Trim the entered and stored passwords before comparing
      const enteredPassword = password.trim();
      const storedPassword = user.password.trim();

      // Check if the entered password matches the stored password
      if (enteredPassword === storedPassword) {
        //res.send('Login successful');
	 // Login successful
            res.send(`
                <script>
                    alert('Login Successful!');
                    window.location.href = '/cutomerhome.html'; // Redirect to home page
                </script>
            `);

      } else {
        //res.send('Invalid username or password');
	// Invalid login
            res.send(`
                <script>
                    alert('Invalid username or password');
                    window.location.href = '/loginregistraionforcustomer.html'; // Redirect to login page
                </script>
            `);
	
      }
    } else {
      //res.send('Invalid username or password');
 	// Invalid login
            res.send(`
                <script>
                    alert('Invalid username or password');
                    window.location.href = '/loginregistraionforcustomer.html'; // Redirect to login page
                </script>
            `);
    }
  });
});


// Home page route
app.get('/cutomerhome.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customerhome.html'));  // Serve the home page from the "public" folder
});

// CUSTOMERS Logout route
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.send('<script>alert("Logout failed!"); window.location.href = "/cutomerhome.html";</script>');
            }
            res.redirect('/'); // Redirect to login page after logout
        });
    } else {
        res.redirect('/'); // Redirect to login page if there's no session
    }
});


//TRAINEE REGISTRATION
// Route to handle form submission and insert data into MySQL
app.post('/trainee', (req, res) => {
  // Destructuring values from req.body
  const {
    first_name, last_name, enrollment_number, mobile_number, gender, date_of_birth,
    trade, district, taluka, village, street_address, pin_code, password
  } = req.body;

  // SQL query with placeholders
  const query = `
    INSERT INTO trainee
    (first_name, last_name, enrollment_number, mobile_number, gender, date_of_birth, trade, district, taluka, village, street_address, pin_code, password, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  // Values to insert into the database
  const values = [
    first_name, last_name, enrollment_number, mobile_number, gender, date_of_birth,
    trade, district, taluka, village, street_address, pin_code, password
  ];

  // Execute the query
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error inserting data: ', err);
      return res.status(500).send('Error inserting data');
    }
    // Respond to the user
    res.status(200).send('Trainee Registration successfully!');
	


  });
});

// TRAINEE LOGIN
// POST route for handling login requests


app.post('/traineelogin', (req, res) => {
  const { mobile_number, password } = req.body;

  // Log the incoming data for debugging
  console.log('Mobile Number:', mobile_number);
  console.log('Password:', password);

  if (!mobile_number || !password) {
    return res.send('Mobile number and password are required');
  }

  const query = 'SELECT * FROM trainee WHERE mobile_number = ?';
  db.query(query, [mobile_number], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      const user = results[0];
      console.log('Stored Password:', user.password);

      // Trim the entered and stored passwords before comparing
      const enteredPassword = password.trim();
      const storedPassword = user.password.trim();

      // Check if the entered password matches the stored password
      if (enteredPassword === storedPassword) {
        //res.send('Login successful');
	 // Login successful
            res.send(`
                <script>
                    alert('Login Successful!');
                    window.location.href = '/traineehome.html'; // Redirect to home page
                </script>
            `);

      } else {
        //res.send('Invalid username or password');
	// Invalid login
            res.send(`
                <script>
                    alert('Invalid username or password');
                    window.location.href = '/loginregistraionfortrainee.html'; // Redirect to login page
                </script>
            `);
	
      }
    } else {
      //res.send('Invalid username or password');
 	// Invalid login
            res.send(`
                <script>
                    alert('Invalid username or password');
                    window.location.href = '/loginregistraionfortrainee.html'; // Redirect to login page
                </script>
            `);
    }
  });
});

// TRAINEE Logout route
app.get('/tlogout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.send('<script>alert("Logout failed!"); window.location.href = "/traineehome.html";</script>');
            }
            res.redirect('/'); // Redirect to login page after logout
        });
    } else {
        res.redirect('/'); // Redirect to login page if there's no session
    }
});




// API route to get users data from MySQL
app.get('/api/users', (req, res) => {
  db.query('SELECT id, first_name,last_name, mobile_number, trade, district, taluka, village FROM trainee', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);  // Log error
      return res.status(500).send('Error fetching data from MySQL');
    }
    console.log('Fetched users:', results);  // Log the fetched data
    res.json(results);
  });
});



// Start the server
//app.listen(port, () => {
    //console.log(`Server running at http://localhost:${port}`);
//});

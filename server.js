var express = require("express");
var fileUploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;
var mysql2 = require("mysql2");

var app = express();
app.use(express.static("Public"));
app.use(express.urlencoded({ extended: true }));
app.use(fileUploader());

app.listen(2005, function() {
    console.log("Server started on port 2005");
});



cloudinary.config({
    cloud_name: 'dk10afadd',
    api_key: '652656954336488',
    api_secret: 'axNuZKNxNbYaiXsyIBFu7PEtjmY'
});









// Use env vars so you can change Aiven host/password without editing code (safe for GitHub + Render)
try { require("dotenv").config(); } catch (e) { /* dotenv optional */ }
let dbConfig = process.env.DATABASE_URL;
if (!dbConfig) {
  console.error("Missing DATABASE_URL. Create a .env file with DATABASE_URL=mysql://user:pass@host:port/defaultdb");
  process.exit(1);
}
let mySqlServer = mysql2.createConnection(dbConfig);

mySqlServer.connect(function(err) {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to Aiven MySQL");
    }
});


app.get("/", function(req, res) {
    let dirName = __dirname;
    let fullpath = dirName + "/Public/index.html";
    res.sendFile(fullpath);
});



app.get("/save-details", function(req, resp) {
    let email = req.query.x;
    let password = req.query.y;
    let userType = req.query.z;

    mySqlServer.query("SELECT * FROM users WHERE email = ?", [email], function(err, result) {
        if (err) {
            resp.status(500).send("Database error: " + err.message);
        } else if (result.length > 0) {
            resp.status(400).send("User already exists. Please log in.");
        } else {
            mySqlServer.query("INSERT INTO users (email, password, userType, dos, status) VALUES (?, ?, ?, CURDATE(), '1')", [email, password, userType], function(err) {
                if (err) {
                    resp.status(500).send("Database error: " + err.message);
                } else {
                    resp.send("Signup Successful");
                }
            });
        }
    });
});









app.get("/login-details", function(req, resp) {
    mySqlServer.query(
        "SELECT * FROM users WHERE email = ? AND password = ?", [req.query.x, req.query.y],
        function(err, resultAry) {
            if (err) {
                console.error("Database error:", err.message);
                resp.status(500).send("Database error: " + err.message);
            } else if (resultAry.length === 0) {
                console.log("Invalid credentials for email:", req.query.x);
                resp.status(401).send("Invalid credentials");
            } else {
                let user = resultAry[0];
                console.log("User found. Status:", user.status, "Type:", user.userType);

                if (user.status === 0) {
                    resp.send("Blocked");
                } else {
                    resp.json({ message: "Success", userType: user.userType });
                }
            }
        }
    );
});







app.get("/volkyc.html", (req, res) => {
    let fullpath = __dirname + "/Public/volkyc.html";
    res.sendFile(fullpath);
});

app.post("/curd-register", async function(req, resp) {
    let fileName = "nopic.jpg";
    let fileName1 = "nopic.jpg";


    if (req.files && req.files.profilePic) {
        let file = req.files.profilePic;
        let locationToSave = __dirname + "/Public/uploads/" + file.name;

        try {
            await file.mv(locationToSave);
            let picUrlResult = await cloudinary.uploader.upload(locationToSave);
            fileName = picUrlResult.secure_url;
            console.log("Profile Pic Uploaded:", fileName);
        } catch (err) {
            console.error("Cloudinary Profile Upload Error:", err.message);
            return resp.status(500).send("Profile Picture Upload Failed: " + err.message);
        }
    }

    if (req.files && req.files.idProof) {
        let file = req.files.idProof;
        let locationToSave = __dirname + "/Public/uploads/" + file.name;

        try {
            await file.mv(locationToSave);
            let picUrlResult = await cloudinary.uploader.upload(locationToSave);
            fileName1 = picUrlResult.secure_url;
            console.log("ID Proof Uploaded:", fileName1);
        } catch (err) {
            console.error("Cloudinary ID Proof Upload Error:", err.message);
            return resp.status(500).send("ID Proof Upload Failed: " + err.message);
        }
    }

    // Get Form Data
    let txtemail1 = req.body.txtemail;
    let txtname = req.body.txtname;
    let txtcontact = req.body.txtcontact;
    let txtaddress = req.body.txtaddress;
    let city = req.body.city;
    let txtGender = req.body.txtGender;
    let txtdob = req.body.txtdob;
    let txtQual = req.body.txtQual;
    let txtOccu = req.body.txtOccu;
    let txtInfo = req.body.txtInfo;


    // Insert Data into MySQL
    mySqlServer.query(
        "INSERT INTO volkycc (txtemail1, txtname, txtcontact, txtaddress, city, txtGender, txtdob, idProofPath, txtQual, txtOccu, txtInfo, profilePicPath) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [txtemail1, txtname, txtcontact, txtaddress, city, txtGender, txtdob, fileName1, txtQual, txtOccu, txtInfo, fileName],
        function(err) {
            if (err) {
                resp.send("Database Error: " + err.message);
            } else {
                resp.send("Record Saved Successfully.. Badhaiiii");
            }
        }
    );
});




app.get("/do-fetch", function(req, res) {
    const email = req.query.KuchBhi;

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    mySqlServer.query("SELECT * FROM volkycc WHERE txtemail1 = ?", [email], function(err, resultAry) {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error occurred" });
        }

        res.json(resultAry);
    });
});





app.get("/client-profile.html", function(req, res) {
    res.sendFile(__dirname + "/Public/client-profile.html");
});
app.post("/save-client-profile", async function(req, resp) {
    let client_id = req.body.client_id;
    let name = req.body.name;
    let business = req.body.business;
    let business_profile = req.body.business_profile;
    let address = req.body.address;
    let city = req.body.city;
    let contact = req.body.contact;
    let id_proof = req.body.id_proof;
    let id_number = req.body.id_number;
    let other_info = req.body.other_info;
    mySqlServer.query(
        "INSERT INTO client_profiles (client_id,name, business, business_profile, address, city, contact, id_proof, id_number, other_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)", [client_id, name, business, business_profile, address, city, contact, id_proof, id_number, other_info],
        function(err) {
            if (err === null) {
                resp.send("Record saved successfully.");
            } else {
                resp.send("Record not saved: " + err.message);
            }
        }
    );

});
app.get("/do-fetch-client", function(req, resp) {
    mySqlServer.query("select * from client_profiles where client_id=?", [req.query.x], function(err, resultAry) {
        resp.send(resultAry);
    })
});

app.post("/do-update-client", function(req, resp) {
    let client_id = req.body.client_id;
    let name = req.body.name;
    let business = req.body.business;
    let business_profile = req.body.business_profile;
    let address = req.body.address;
    let city = req.body.city;
    let contact = req.body.contact;
    let id_proof = req.body.id_proof;
    let id_number = req.body.id_number;
    let other_info = req.body.other_info;

    mySqlServer.query(
        "UPDATE client_profiles SET name=?, business=?, business_profile=?, address=?, city=?, contact=?, id_proof=?, id_number=?, other_info=? WHERE client_id=?", [name, business, business_profile, address, city, contact, id_proof, id_number, other_info, client_id],
        function(err, result) {
            if (err == null) {
                resp.send("Data Updated Successfully.. Badhaiiii");
            } else {
                resp.send("Database Error: " + err.message);
            }
        }
    );
});
app.post("/do-update", async function(req, resp) {
    let txtemail1 = req.body.txtemail;
    let txtname = req.body.txtname;
    let txtcontact = req.body.txtcontact;
    let txtaddress = req.body.txtaddress;
    let city = req.body.city;
    let txtGender = req.body.txtGender;
    let txtdob = req.body.txtdob;
    let txtQual = req.body.txtQual;
    let txtOccu = req.body.txtOccu;
    let txtInfo = req.body.txtInfo;

    let fileName = req.body.profilePicPath; // Default to existing value
    let fileName1 = req.body.IProofPath; // Default to existing value

    if (req.files != null) {
        if (req.files.profilePic) {
            let profilePic = req.files.profilePic;
            let locationToSave = __dirname + "/Public/uploads/" + profilePic.name;
            await profilePic.mv(locationToSave);
            try {
                await cloudinary.uploader.upload(locationToSave).then(function(picUrlResult) {
                    fileName = picUrlResult.secure_url;
                });
            } catch (err) {
                console.error("Profile Pic Upload Error:", err.message);
                return resp.status(500).send("Profile Picture Upload Failed: " + err.message);
            }
        }

        if (req.files.idProof) {
            let idProof = req.files.idProof;
            let locationToSave = __dirname + "/Public/uploads/" + idProof.name;
            await idProof.mv(locationToSave);
            try {
                await cloudinary.uploader.upload(locationToSave).then(function(picUrlResult) {
                    fileName1 = picUrlResult.secure_url;
                });
            } catch (err) {
                console.error("ID Proof Upload Error:", err.message);
                return resp.status(500).send("ID Proof Upload Failed: " + err.message);
            }
        }
    }

    mySqlServer.query(
        "UPDATE volkycc SET txtname=?, txtcontact=?, txtaddress=?, city=?, txtGender=?, txtdob=?, idProofPath=?, txtQual=?, txtOccu=?, txtInfo=?, profilePicPath=? WHERE txtemail1=?", [txtname, txtcontact, txtaddress, city, txtGender, txtdob, fileName1, txtQual, txtOccu, txtInfo, fileName, txtemail1],
        function(err, result) {
            if (err == null) {
                resp.send("Data Updated Successfully.. Badhaiiii");
            } else {
                resp.send("Database Error: " + err.message);
            }
        }
    );
});


app.post("/save-post", function(req, resp) {
    let jobid = req.body.jobid;
    let jobtitle = req.body.jobtitle;
    let jobtype = req.body.jobtype;
    let address = req.body.address;
    let city = req.body.city;
    let edu = req.body.edu;
    let contact = req.body.contact;
    // let cid = req.body.cid;


    mySqlServer.query(
        "INSERT INTO jobs (jobid,jobtitle, jobtype, address,city,edu, contact) VALUES ( ?, ?, ?, ?, ?, ?,?)", [jobid, jobtitle, jobtype, address, city, edu, contact],
        function(err) {
            if (err === null) {
                resp.send("Job published successfully.");
            } else {
                resp.send("Job can't be published: " + err.message);
            }
        }
    );

});

app.get("/Find_work.html", (req, res) => {
    let fullpath = __dirname + "/Public/Find_work.html";
    res.sendFile(fullpath);
});


app.get("/client_manager.html", (req, res) => {
    let fullpath = __dirname + "/Public/client_manager.html";
    res.sendFile(fullpath);
});

app.get("/vol_manager.html", (req, res) => {
    let fullpath = __dirname + "/Public/vol_manager.html";
    res.sendFile(fullpath);
});

app.get("/job_manager.html", (req, res) => {
    let fullpath = __dirname + "/Public/job_manager.html";
    res.sendFile(fullpath);
});

//------------access all cities of client post
app.get("/all-records-client-city", function(req, resp) {
    mySqlServer.query("select distinct city from jobs ", function(err, result) {
        resp.send(result);
    })
});


//-----------access all job titles of client post
app.get("/all-records-client-title", function(req, resp) {
    mySqlServer.query("select distinct jobtitle from jobs ", function(err, result) {
        resp.send(result);    
    })
});

app.get("/all-records-client-jobid", function(req, resp) {
    mySqlServer.query("select distinct jobid from jobs ", function(err, result) {
        resp.send(result);    
    })
});
// dofetchallid

app.get("/all-clients", function(req, resp) {
    mySqlServer.query("SELECT client_id, name, business, city, contact FROM client_profiles", function(err, result) {
        console.log(result);
        resp.send(result);
    });
});

app.get("/all-volunteers", (req, res) => {
    mySqlServer.query("SELECT * FROM volkycc", function(err, result) {
        if (err) {
            console.error("Database error:", err);
            res.status(500).send("Error fetching data");
        } else {
            res.json(result);
        }
    });
});




app.get("/all-related-jobs", function(req, res) {
    mySqlServer.query("SELECT * FROM jobs", function(err, result) {
        if (err) {
            // console.error("Database error:", err);
            res.status(500).send("Database error");
        } else {
            // console.log("Sending Data:", result);
            res.json(result); // 
        }
    });
});




app.get("/do-fetch-1", function(req, resp) {
    // console.log(req.query)
    if (req.query.city == "All")
        query = "select * from jobs"
    else
        query = "select * from jobs where city=?"
    mySqlServer.query(query, [req.query.city], function(err, result) {
        // console.log(result);
        resp.send(result);
    })
});


app.get("/do-fetch-2", function(req, resp) {
    console.log(req.query)
    console.log(req.query)
    if (req.query.jobtitle == "All")
        query = "select * from jobs"
    else
        query = "select * from jobs where jobtitle=?"
    mySqlServer.query(query, [req.query.jobtitle], function(err, result) {
        console.log(result);
        resp.send(result);
    })
});

app.get("/do-fetch-3", function(req, resp) {
    // console.log(req.query)
    if (req.query.jobid == "All")
        query = "select * from jobs"
    else
        query = "select * from jobs where jobid=?"
    mySqlServer.query(query, [req.query.jobid], function(err, result) {
        // console.log(result);
        resp.send(result);
    })
});
app.get("/do-delete-one", function(req, resp) {
    let jobid = req.query.jobid;
    //col name Same as  table col name
    mySqlServer.query("delete from jobs where jobid=?", [jobid], function(err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record Deleted Successfulllyyyy");
            else
                resp.send("Inavlid User Id");
        } else
            resp.send(err.message);
    })
});



app.get("/fetch-all-users", (req, res) => {
    const query = "SELECT email, userType, status FROM users";

    mySqlServer.query(query, (err, result) => {
        if (err) {
            console.log("DB error:", err);
            res.status(500).send("Error");
        } else {
            res.json(result);
        }
    });
});



// Route to update user status
app.get("/update-status", function(req, res) {
    const { email, status } = req.query;
    mySqlServer.query("UPDATE users SET status = ? WHERE email = ?", [status, email], function(err, result) {
        if (err) res.send(err.message);
        else res.send("Status Updated Successfully");
    });
});
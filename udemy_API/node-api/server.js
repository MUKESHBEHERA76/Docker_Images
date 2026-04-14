const express = require("express");
const basicAuth = require("basic-auth");

const app = express();
app.use(express.json());

/*
GLOBAL LOGGER
Logs endpoint, headers, query params, body and response
*/
app.use((req, res, next) => {

    console.log("====================================");
    console.log("Endpoint Invoked:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Query Params:", req.query);
    console.log("Request Body:", req.body);

    const oldSend = res.send;

    res.send = function (data) {
        console.log("Response:", data);
        console.log("====================================");
        oldSend.apply(res, arguments);
    };

    next();
});


/*
1. /sumUsingParam
example
/sumUsingParam?num1=10&num2=20
*/
app.get("/sumUsingParam", (req, res) => {

    const num1 = Number(req.query.num1);
    const num2 = Number(req.query.num2);

    const result = num1 + num2;

    res.json({
        result: result
    });

});


/*
2. /sum
POST JSON
{
  "num1":10,
  "num2":20
}
*/
app.post("/sum", (req, res) => {

    const { num1, num2 } = req.body;

    const result = Number(num1) + Number(num2);

    res.json({
        result: result
    });

});


/*
3. /sample
Echo request headers + body
*/
app.post("/sample", (req, res) => {

    res.set(req.headers);

    res.json({
        headersReceived: req.headers,
        requestBody: req.body
    });

});


/*
BASIC AUTH MIDDLEWARE
*/
function checkAuth(req, res, next) {

    const user = basicAuth(req);

    if (!user || user.name !== "admin" || user.pass !== "admin") {

        res.set("WWW-Authenticate", "Basic realm=Authorization Required");
        return res.status(401).json({
            message: "Unauthorized"
        });

    }

    next();
}


/*
4. /sumUsingAuth
*/
app.post("/sumUsingAuth", checkAuth, (req, res) => {

    const { num1, num2 } = req.body;

    const result = Number(num1) + Number(num2);

    res.json({
        result: result
    });

});


/*
5. requestTransformation
swap num1 and num2
*/
app.post("/reqTransformation", (req, res) => {

    const { num1, num2 } = req.body;

    res.json({
        num1: num2,
        num2: num1
    });

});


/*
6. responseTransformation
*/
app.post("/responseTransformation", (req, res) => {

    const response = {
        result: req.body.result,
        message: "this is transformed"
    };

    res.json(response);

});


app.listen(3000, () => {
    console.log("API Server running on port 3000");
});


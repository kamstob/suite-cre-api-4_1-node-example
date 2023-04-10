const https = require("node:https");
const md5 = require('md5');
const querystring = require('node:querystring');
const apiPath = '/service/v4_1/rest.php';

const hostName = 'SUITE_CRM_HOST_NAME'; //eg. crm.example.com
const userName = 'YOUR_USER_NAME';
const password = 'YOUR_PASSWORD';

async function main() {

    try {

        //login
        let user = await restRequest({
            method: 'login',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: JSON.stringify({
                user_auth: {
                    user_name: userName,
                    password: md5(password)
                }
            })
        });

        user = JSON.parse(user);

        console.log({user});

        //set a new lead
        const result = await restRequest({
            method: 'set_entry',
            input_type: 'JSON',
            response_type: 'JSON',
            rest_data: JSON.stringify({
                session: user.id,
                module_name: 'Leads',
                name_value_list: {
                    first_name: 'Max',
                    last_name: 'Planck',
                    industry_c: 'Other',
                    obtained_c: 'Telemarketing',
                    lead_source_description: 'JUST FOR TEST'
                }
            })
        });

        console.log({result});

    } catch (error) {
        console.log('ERROR:', error);
    }

}

main();

function restRequest(arguments) {
    const data = querystring.stringify(arguments);
    return postReq(hostName, apiPath, data)
}


function postReq(host, path, obj) {

    return new Promise((resolve, reject) => {
        const options = {
            host,
            path,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        };
        const req = https.request(options, (res) => {
            if (res.statusCode != 200) {
                return reject(new Error(`HTTP status code ${res.statusCode}`))
            }

            const body = [];
            res.on('data', (chunk) => body.push(chunk))
            res.on('end', () => {
                resolve(Buffer.concat(body).toString())
            })
        });
        req.on('error', (e) => {
            reject(e.message);
        });
        req.write(obj)
        req.end();
    });
}
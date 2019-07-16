"use strict"
const global_path = 'http://jackal-testing.pl/crudapi/';

const configApp = {
    maxRows: 6
};


function fetch_api({
    url,
    data,
    callback
}) {

    const prepareParams = {
        headers: {
            "content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(data),
        method: "POST",
        mode: "cors"
    };


    fetch(url, prepareParams)
        .then(resp => resp.json())
        .then(resp => {
            callback(resp);
        })
}



window.addEventListener('DOMContentLoaded', (event) => {

    const result = document.getElementById('result');
    const app = document.getElementById('app');
    const x = document.getElementById('btn');

	// jeśli jesteś zalogowany wczytaj aplikacje.
    if (localStorage.getItem('token')) {

        Object.assign(app.style, {
            display: 'none'
        });


        init({
            admin: localStorage.getItem('admin'),
            token: localStorage.getItem('token'),
            login: localStorage.getItem('username')

        });

    }


    x.addEventListener('click', () => {

        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;


        fetch_api({
            url: `${global_path}login.php`,
            data: {
                login,
                password
            },
            callback: (res) => {


                const transition = 1000;


                result.textContent = res.message;
                Object.assign(result.style, {
                    transition: `${transition/1000}s`,
                    opacity: "1"
                });
                //console.log(res);

                if (res.login) {
                    setTimeout(() => {
                        Object.assign(app.style, {
                            transition: `${transition/1000}s`,
                            opacity: "0"
                        });
                    }, transition);
                    setTimeout(() => {
                        app.style.display = 'none';
                        init(res);

                    }, transition * 2);

                }
            }
        });
    });




});

class User {
    constructor({
        admin,
        login,
        token
    }) {
        this.username = login;
        this.admin = admin;
        this.token = token;


    }

    saveLS() {

        localStorage.setItem('token', this.token);
        localStorage.setItem('admin', this.admin);
        localStorage.setItem('username', this.username);

    }

    getLS() {
        return {
            token: localStorage.getItem('token')
        };
    }


}



function refreshTable(res, user) {




    const appTable = document.getElementById('table');
    const panel = document.getElementById('panel');
    const table = [];

    appTable.style.display = 'flex';
    setTimeout(() => {
        appTable.style.opacity = '1';
    }, 100);

    Object.assign(panel.style, {
        transition: '1s',
        opacity: '1'
    });

	// kasowanie wszystkich elementów z obiektu tablicy
    while (appTable.firstChild !== null) {
        appTable.removeChild(appTable.firstChild);
    }

	
    appTable.addEventListener('change', (e) => {


        const tmp = e.target.id.split('.');
        const changeData = {
            id_product: tmp[0],
            field: tmp[1],
            value: e.target.value,
            token: user.token
        }

        fetch_api({
            url: `${global_path}fieldupdate.php`,
            data: changeData,
            callback: (res) => {
                //console.log('here', res);
            }
        });



    });

    //console.log(res);

    for (let key in res) {
        table.push(res[key]);
    }

    //console.log(table);
    const border = document.createElement('div');
    border.className = 'border-extra';
    appTable.appendChild(border);

    const headers = document.createElement('div');
    headers.className = 'row';
    border.appendChild(headers);

    let lastclass = 'header-d';

    Object.keys(table[0]).forEach((e) => {


        if (e === 'id_product' || e === 'deleted') {
            return;
        }

        const el = document.createElement('div');


        if (lastclass === 'header-d') {
            el.className = 'header';
            lastclass = 'header';
        } else {
            el.className = 'header header-d';
            lastclass = 'header-d';
        }


        el.textContent = e;
        headers.appendChild(el);

    });




    table.forEach((item) => {

        const row = document.createElement('div');
        row.className = 'row';
        border.appendChild(row);

        lastclass = 'item-d';

        const index = item['id_product'];


        const delBtn = document.createElement('div');
        delBtn.className = 'del-row';
        delBtn.id = `${index}`;
        delBtn.textContent = 'X';

        if (user.admin && table.length > 1) {
            row.appendChild(delBtn);
        }

        delBtn.addEventListener('click', () => {

            const id = index;

            fetch_api({
                url: `${global_path}rowdel.php`,
                data: {
                    token: user.token,
                    id: id
                },
                callback: (e) => {

                   // console.log(e);

                    fetch_api({
                        url: `${global_path}read.php`,
                        data: {
                            token: user.token
                        },
                        callback: (res) => {
                            refreshTable(res, user);
                        }
                    });

                }
            });


        });



        for (let key in item) {

            if (key !== 'id_product' && key !== 'deleted') {


                const el = document.createElement('input');

                if (lastclass === 'item-d') {
                    el.className = 'item';
                    lastclass = 'item';
                } else {
                    el.className = 'item item-d';
                    lastclass = 'item-d';
                }
                el.type = 'text';
                el.value = item[key];
                el.id = `${index}.${key}`;
                row.appendChild(el);
            }

        }

    });


    const addRow = document.createElement('div');
    addRow.className = 'row extra-row';
    addRow.textContent = '+ Add row';
    if (user.admin && table.length < configApp.maxRows) {
        appTable.appendChild(addRow);
    }
    addRow.addEventListener('click', () => {



        fetch_api({
            url: `${global_path}rowadd.php`,
            data: {
                token: user.token
            },
            callback: () => {

                fetch_api({
                    url: `${global_path}read.php`,
                    data: {
                        token: user.token
                    },
                    callback: (res) => {
                        refreshTable(res, user);
                    }
                });

            }
        });


    });

}


function init(userData) {

    const user = new User(userData);
    user.saveLS();


    const unlogBtn = document.getElementById('ds');
    unlogBtn.addEventListener('click', () => {

        localStorage.clear();
        location.reload();

    });

    const refBtn = document.getElementById('ref');

    refBtn.addEventListener('click', () => {

        fetch_api({
            url: `${global_path}read.php`,
            data: {
                token: user.token
            },
            callback: (res) => {
                refreshTable(res, user);
            }
        });

    });

    refBtn.click();


}
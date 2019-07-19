"use strict"


const unwanted_columns = ['id_product','deleted'];
const global = {ignoreRow:[...unwanted_columns],path:'http://jackal-testing.pl/crudapi/'};

const configApp = {
    maxRows: 6
};



class DOMcreator {
    constructor(){
		
   // empty


    }

    create({type,className,text,parent,src,id}){
	
	if(typeof type == 'undefined'){throw 'Please insert type of element'};
	
	
	const newElem = document.createElement(type);
	
	if(typeof className !== 'undefined'){
		newElem.className = className;
	}
	
	
	if(typeof text !== 'undefined'){
		newElem.textContent = text;
	}
	
	if(typeof id !== 'undefined'){
		newElem.id = id;
	}
	
	if(typeof parent !== 'undefined'){
		parent.appendChild(newElem);
	}
	
	
	if(typeof src !== 'undefined'){
		newElem.src = `${src}`;
	}
	
	
	return newElem;
}


}

function init_show_column(user){
	
	const app = document.getElementById('showtb');
	
	while (app.firstChild !== null) {
        app.removeChild(app.firstChild);
    }
	
	
		global.ignoreRow.forEach((e)=>{
		
		if(unwanted_columns.includes(e)){
			return;
		}
		
		const creator = new DOMcreator;
		
		const item = creator.create({type:'div',className:'show-item',parent:app,text:`show ${e}`});
		
		item.addEventListener('click',()=>{
			console.log('cc');
			global.ignoreRow = global.ignoreRow.filter(el => el !== e);
			
			fetch_api({
                        url: `${global.path}read.php`,
                        data: {
                            token: user.token
                        },
                        callback: (res) => {
                            refreshTable(res, user);
                        }
                    });
			
		})
		
		
	});
}

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
            url: `${global.path}login.php`,
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


	const Creator = new DOMcreator;

    const appTable = document.getElementById('table');
    const panel = document.getElementById('panel');
	const lgBtn = document.getElementById('ds');
    const table = [];

	lgBtn.style.display = 'flex';
    appTable.style.display = 'flex';
    setTimeout(() => {
		lgBtn.style.opacity = '.6';
        appTable.style.opacity = '1';
    }, 100);

    Object.assign(panel.style, {
        transition: '1s',
        opacity: '1'
    });

	init_show_column(user);
	
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
            url: `${global.path}fieldupdate.php`,
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
	
	
    const border = Creator.create({type:'div',className:'border-extra',parent:appTable});
	const headers = Creator.create({type:'div',className:'row',parent:border});

  

    let lastclass = 'header-d';
	
    Object.keys(table[0]).forEach((e) => {
		//console.log(global.ignoreRow)

        if (global.ignoreRow.includes(e)) {
            return;
        }

        const el = Creator.create({type:'div'});


        if (lastclass === 'header-d') {
            el.className = 'header';
            lastclass = 'header';
        } else {
            el.className = 'header header-d';
            lastclass = 'header-d';
        }


        el.textContent = e;
		
		if(Object.keys(table[0]).length > global.ignoreRow.length+1){
		const hideBtn = Creator.create({type:'div',className:'row-hide',parent:el,text:'Hide'});
		
		hideBtn.addEventListener('click',()=>{
			
			global.ignoreRow.push(e);
			
			fetch_api({
                        url: `${global.path}read.php`,
                        data: {
                            token: user.token
                        },
                        callback: (res) => {
                            refreshTable(res, user);
                        }
                    });
			
			
		});
		}
        headers.appendChild(el);

    });




    table.forEach((item) => {
	
        const row = Creator.create({type:'div',className:'row',parent:border});

        lastclass = 'item-d';

        const index = item['id_product'];

		
		
		
        const delBtn = Creator.create({type:'div',className:'del-row',id:'${index}',text:'X'});

        if (user.admin && table.length > 1) {
            row.appendChild(delBtn);
        }

        delBtn.addEventListener('click', () => {

            const id = index;

            fetch_api({
                url: `${global.path}rowdel.php`,
                data: {
                    token: user.token,
                    id: id
                },
                callback: (e) => {

                   // console.log(e);

                    fetch_api({
                        url: `${global.path}read.php`,
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

            if (!global.ignoreRow.includes(key)) {


                const el = Creator.create({type:'input'});;

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


    const addRow = Creator.create({type:'div',className:'row extra-row',text:'+ Add row'});
	
    if (user.admin && table.length < configApp.maxRows) {
        appTable.appendChild(addRow);
    }
	
    addRow.addEventListener('click', () => {

        fetch_api({
            url: `${global.path}rowadd.php`,
            data: {
                token: user.token
            },
            callback: () => {

                fetch_api({
                    url: `${global.path}read.php`,
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
		unlogBtn.style.opacity = '0';

    });

    const refBtn = document.getElementById('ref');

    refBtn.addEventListener('click', () => {

        fetch_api({
            url: `${global.path}read.php`,
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
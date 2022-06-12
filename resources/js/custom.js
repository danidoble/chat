const container_username = document.getElementById('container-username');
const container_list_users = document.getElementById('container-list-users');
const container_chat = document.getElementById('container-chat');
const container_messages = document.getElementById('messages');
const container_current_users = document.getElementById('list-current-users');
const el_username = document.getElementById('username');
const el_form = document.getElementById('form-message');
const el_send = document.getElementById('btn-send');
const el_message = document.getElementById('comment');
const el_file = document.getElementById('file');
const el_audio_noti = document.getElementById('sound');
const allow_download = false;
let first_load = true;
const socket = io();
const id_usr = sessionStorage.getItem('id_usr') ?? (() => {
    sessionStorage.setItem('id_usr', ((new Date()).getTime()).toString());
    return sessionStorage.getItem('id_usr');
})();
let username = sessionStorage.getItem('username') ?? id_usr;
el_username.value = username;
const others_template = '<div class="w-full mb-2 text-xs break-all {{ id_username }}">{{ username }}</div><div class="message font-emoji text-lg break-all">{{ message }}</div><div class="w-full mt-2 text-xs break-all text-right">{{ date }}</div>';
const own_template = '<div class="w-full mb-2 text-xs break-all {{ id_username }}">{{ username }}</div><div class="message font-emoji text-lg break-all">{{ message }}</div><div class="w-full mt-2 text-xs break-all text-right">{{ date }}</div>';

document.querySelectorAll('.btn-switch-theme').forEach((el) => {
    el.addEventListener('click', () => {
        let htmlClasses = document.querySelector('html').classList;
        if (localStorage.theme === 'dark') {
            htmlClasses.remove('dark');
            localStorage.removeItem('theme');
            document.getElementById('btn-sun-theme').classList.add('hidden');
            document.getElementById('btn-moon-theme').classList.remove('hidden');
        } else {
            htmlClasses.add('dark');
            localStorage.theme = 'dark';
            document.getElementById('btn-sun-theme').classList.remove('hidden');
            document.getElementById('btn-moon-theme').classList.add('hidden');
        }
    });
});
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.getElementById('btn-sun-theme').classList.remove('hidden');
    document.getElementById('btn-moon-theme').classList.add('hidden');
} else {
    document.getElementById('btn-sun-theme').classList.add('hidden');
    document.getElementById('btn-moon-theme').classList.remove('hidden');
}

function dateSpanish(unix) {
    let date = new Date();
    let arr_date = date.toLocaleDateString().split('/');
    let day = arr_date[1];
    let month = ((month) => {
        switch (month) {
            case 1:
                return 'Enero';
            case 2:
                return 'Febrero';
            case 3:
                return 'Marzo';
            case 4:
                return 'Abril';
            case 5:
                return 'Mayo';
            case 6:
                return 'Junio';
            case 7:
                return 'Julio';
            case 8:
                return 'Agosto';
            case 9:
                return 'Septiembre';
            case 10:
                return 'Ocutubre';
            case 11:
                return 'Noviembre';
            default:
                return 'Diciembre';
        }
    })(parseInt(arr_date[0]));
    let year = arr_date[2];

    return day + ' ' + month + ' ' + year + ' ' + date.toLocaleTimeString();
}

function showUsername() {
    container_username.classList.remove('hidden');
    container_chat.classList.add('hidden');
}

function showListUsers() {
    container_list_users.classList.toggle('hidden');
}

socket.on('disconnect', function () {
    console.warn('Se perdio la conexion con el servidor!');
    el_send.setAttribute('disabled', 'disabled');
    el_send.innerText = "Sin conexion";
    el_send.classList.remove('bg-indigo-600', 'hover:bg-indigo-700')
    el_send.classList.add('bg-red-600', 'hover:bg-red-700')
});
socket.on('connect', function () {
    console.log('Conectado!');
    if (first_load) {
        first_load = false;
        socket.emit('prev messages', id_usr);
        socket.emit('users', username, id_usr);
    }

    el_send.removeAttribute('disabled');
    el_send.innerText = "Enviar";
    el_send.classList.add('bg-indigo-600', 'hover:bg-indigo-700')
    el_send.classList.remove('bg-red-600', 'hover:bg-red-700')
});

document.getElementById('form-username').addEventListener('submit', (e) => {
    e.preventDefault();
    container_username.classList.add('hidden');
    container_chat.classList.remove('hidden');
    username = el_username.value;
    sessionStorage.setItem('username', el_username.value);
    socket.emit('update username', username, id_usr);
});

el_form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (el_message.value.trim()) {
        if (el_file.files[0]) {
            if (el_file.files[0].size > 5e6) {
                alert("Esta imágen es demasiado grande, no se subirá");
                return false;
            }
            let reader = new FileReader();
            let rawData = new ArrayBuffer();
            reader.loadend = function () {
            }
            reader.onload = function (e) {
                rawData = e.target.result;
                socket.emit("chat image", rawData, el_message.value.trim(), el_username.value, id_usr);
                document.getElementById('form-message').reset()
            }
            reader.readAsArrayBuffer(el_file.files[0]);
        } else {
            socket.emit("chat message", el_message.value.trim(), el_username.value, id_usr);
            document.getElementById('form-message').reset()
        }
    }
});
socket.on('actives', function () {
    socket.emit('users', username, id_usr);
});
socket.on('users', function (users) {
    let li = "";
    for (let i = 0; i < users.length; i++) {
        li += "<li class='w-full max-h-12 overflow-hidden text-ellipsis break-all inline-flex'><svg class=\"mr-1.5 mt-2 h-2 w-2 text-green-600\" fill=\"currentColor\" viewBox=\"0 0 8 8\"><circle cx=\"4\" cy=\"4\" r=\"3\" /></svg><span class='id-" + users[i]['id'] + "'>" + users[i]['username'] + "</span></li>";
    }
    container_current_users.innerHTML = li;
});
socket.on('update username', function (usr, id) {
    document.querySelectorAll('.id-' + id).forEach((el) => {
        el.innerText = usr;
    });
});
socket.on('prev messages', function (msg, file, usr, id, time, new_id, type = "message") {
    if (id_usr === new_id) {
        let item = document.createElement('div');
        let html = '';
        if (id === id_usr) {
            item.classList.add('w-full', 'break-all', 'ml-auto', 'max-w-[90%]', 'md:max-w-lg', 'lg:max-w-xl', 'xl:max-w-2xl', 'p-4', 'm-3', 'rounded-2xl', 'bg-sky-200', 'dark:bg-sky-800', 'own');
            html = own_template.replace('{{ username }}', 'Tú');
        } else {
            item.classList.add('w-full', 'break-all', 'max-w-[90%]', 'md:max-w-lg', 'lg:max-w-xl', 'xl:max-w-2xl', 'p-4', 'm-3', 'rounded-2xl', 'bg-stone-200', 'dark:bg-gray-700', 'others');
            html = others_template;
        }
        if (type === "image") {
            let arrayBufferView = new Uint8Array(file);
            let blob = new Blob([arrayBufferView], {type: "image/webp"});
            let urlCreator = window.URL || window.webkitURL;
            let imageUrl = urlCreator.createObjectURL(blob);
            let id_image = 'chat-img-' + (new Date()).getTime();

            html = html.replace("{{ message }}", "<div class='w-full mb-3'>" + msg.replace(/(?:\r\n|\r|\n)/g, '<br>') + "</div><img src='' alt='Imagen' class='max-w-full mx-auto w-auto h-auto max-h-80' id='" + id_image + "'/>");
            item.innerHTML = (html).replace('{{ username }}', usr).replace('{{ id_username }}', 'id-' + id).replace('{{ date }}', dateSpanish(time))
            setTimeout(() => {
                let img = document.getElementById(id_image);
                img.src = imageUrl;
                if (!allow_download) {
                    img.onload = function () {
                        urlCreator.revokeObjectURL(imageUrl) // liberar memoria
                    }
                }
            }, 300)
        } else {
            html = html.replace('{{ message }}', msg.replace(/(?:\r\n|\r|\n)/g, '<br>'));
            item.innerHTML = (html).replace('{{ username }}', usr).replace('{{ id_username }}', 'id-' + id).replace('{{ date }}', dateSpanish(time))
        }

        container_messages.appendChild(item);

        document.querySelectorAll('.id-' + id).forEach((el) => {
            el.innerText = usr;
        })

        window.scrollTo(0, document.body.scrollHeight);
    }
});
socket.on('chat message', function (msg, file, usr, id, time, type = "message") {
    let item = document.createElement('div');
    let html = '';
    if (id === id_usr) {
        item.classList.add('w-full', 'break-all', 'ml-auto', 'max-w-[90%]', 'md:max-w-lg', 'lg:max-w-xl', 'xl:max-w-2xl', 'p-4', 'm-3', 'rounded-2xl', 'bg-sky-200', 'dark:bg-sky-800', 'own');
        html = own_template.replace('{{ username }}', 'Tú');
    } else {
        item.classList.add('w-full', 'break-all', 'max-w-[90%]', 'md:max-w-lg', 'lg:max-w-xl', 'xl:max-w-2xl', 'p-4', 'm-3', 'rounded-2xl', 'bg-stone-200', 'dark:bg-gray-700', 'others');
        html = others_template;
    }
    if (type === "image") {
        let arrayBufferView = new Uint8Array(file);
        let blob = new Blob([arrayBufferView], {type: "image/webp"});
        let urlCreator = window.URL || window.webkitURL;
        let imageUrl = urlCreator.createObjectURL(blob);
        let id_image = 'chat-img-' + (new Date()).getTime();

        html = html.replace("{{ message }}", "<div class='w-full mb-3'>" + msg.replace(/(?:\r\n|\r|\n)/g, '<br>') + "</div><img src='' alt='Imagen' class='max-w-full mx-auto w-auto h-auto max-h-80' id='" + id_image + "'/>");
        item.innerHTML = (html).replace('{{ username }}', usr).replace('{{ id_username }}', 'id-' + id).replace('{{ date }}', dateSpanish(time))
        setTimeout(() => {
            let img = document.getElementById(id_image);
            img.src = imageUrl;
            if (!allow_download) {
                img.onload = function () {
                    urlCreator.revokeObjectURL(imageUrl) // liberar memoria
                }
            }
        }, 300)
    } else {
        html = html.replace('{{ message }}', msg.replace(/(?:\r\n|\r|\n)/g, '<br>'));
        item.innerHTML = (html).replace('{{ username }}', usr).replace('{{ id_username }}', 'id-' + id).replace('{{ date }}', dateSpanish(time))
    }

    container_messages.appendChild(item);

    document.querySelectorAll('.id-' + id).forEach((el) => {
        el.innerText = usr;
    })

    if (id_usr !== id) {
        el_audio_noti.pause();
        el_audio_noti.currentTime = 0;
        el_audio_noti.play()
    }

    window.scrollTo(0, document.body.scrollHeight);
});
import {LoadingPage} from "../../components/_loading";
import {User} from "../../entity/user";
import {Notify} from "../../components/_notify";
import {Chat} from "../../components/_chat";
import {Message} from "../../entity/message";
const {sendMessage} = require("./dom/input.listeners");

let chat = null;

export function loadListenersGlobals(socket) {

    socket.on('load', (l) => {
        if (l.status === "success") {
            const loadingPage = new LoadingPage(document.querySelector("body"));
            const appPage = document.querySelector('.chat');
            appPage.classList.remove('d-none');
            appPage.classList.add('d-flex');
            loadingPage.show();

            loadingPage.updateMsg("Connexion au serveur...");
            const currentUser = (new User())
                .setIdWs(l.result.currentUser._idWs)
                .setPseudo(l.result.currentUser._pseudo)
                .setToken(l.result.currentUser._token);

            loadingPage.updateMsg("Chargement des utilisateurs en ligne");
            const onlineUsers = [];
            l.result.onlineUsers.forEach((onlineUser) => {
                onlineUsers.push((new User())
                    .setIdWs(onlineUser._idWs)
                    .setPseudo(onlineUser._pseudo)
                    .setToken(onlineUser._token)
                );
            });

            loadingPage.updateMsg("Chargement des rooms");
            const rooms = l.result.rooms;

            loadingPage.updateMsg("Chargement des messages");
            const messages = [];
            l.result.messages.forEach((message) => {
                messages.push(new Message()
                    .setAuthor(message._author)
                    .setContent(message._content)
                    .setCreatedAt(new Date(message._createdAt))
                );
            });

            chat = new Chat(currentUser, messages, onlineUsers, rooms);

            chat.getInputSend().addEventListener("keyup", (e) => {
                sendMessage(socket, chat, e);
            });
            _load();

            loadingPage.updateMsg("Vous êtes connecté !<br/>Bienvenue "+currentUser.getPseudo());

            setTimeout(() => loadingPage.hide(), 200);
        }
    });

    socket.on('error', (l) => {
        socket.disconnect();
        const loadingPage = new LoadingPage(document.querySelector("body"));
        loadingPage.show();
        loadingPage.updateMsg(l.result.message);

        setTimeout(() => {
            window.location = '/se-deconnecter';
        }, 5000);
    });

    const _load = () => {
        socket.on('user-logout', (l) => {
            chat.removeUser(l, (pseudo) => {
                Notify.info(pseudo + " s'est déconnecté.",
                    "",{
                        showClose: false
                    }
                );
            });
        });

        socket.on('user-login', (l) => {
            chat.addUser(l, (pseudo) => {
                Notify.info(pseudo + " s'est connecté.",
                    "",{
                        showClose: false
                    }
                );
            });
        });

        socket.on('add-message', (msg) => {
            const message = new Message()
                .setAuthor(msg['_author'])
                .setContent(msg['_content'])
                .setCreatedAt(new Date(msg['_createdAt']));

            chat.addMessage(message);
        });

        socket.on('disconnect', () => {
            /*    setTimeout(() => {
                    window.location = '/se-deconnecter';
                }, 3000);*/
        });
    }
}
import {LoadingPage} from "../../components/_loading";
import {User} from "../../entity/user";
import {Notify} from "../../components/_notify";
import {Chat} from "../../components/_chat";
import {Message} from "../../entity/message";
const {sendMessage, showInputEditMessage, inputDeleteMessage} = require("./dom/input.listeners");

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
                    .setTokenActions(message._tokenActions)
                );
            });

            chat = new Chat(currentUser, messages, onlineUsers, rooms);

            chat.getInputSend().addEventListener("keyup", (e) => {
                    sendMessage(null, null, e, "add");
            });

            chat.getInputSend().addEventListener("keydown", (e) => {
                    sendMessage(socket, chat, e, "add");
            });

            const toolsElements = document.querySelectorAll(".chat-messages-tools");
            toolsElements.forEach((toolsElement) => {
                const editElement = toolsElement.querySelector('i.fa-pen');
                const deleteElement = toolsElement.querySelector('i.fa-trash-alt');
                editElement.addEventListener("click", () => {
                    showInputEditMessage(socket, chat, editElement);
                });

                deleteElement.addEventListener("click", () => {
                    inputDeleteMessage(socket, chat, deleteElement);
                });

                editElement.parentElement.parentElement.addEventListener("dblclick", () => {
                    showInputEditMessage(socket, chat, editElement);
                });
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

        socket.on('action-message', (msg, action) => {
            const message = new Message()
                .setAuthor(msg['_author'])
                .setContent(msg['_content'])
                .setCreatedAt(new Date(msg['_createdAt']))
                .setTokenActions(msg['_tokenActions']);

            if (action === "add") {
                const elementDOM = chat.addMessage(message);

                const inputEdit = elementDOM.querySelector(".chat-messages-tools .fa-pen");
                inputEdit.addEventListener("click", () => {
                    showInputEditMessage(socket, chat, inputEdit);
                });

                inputEdit.parentElement.parentElement.addEventListener("dblclick", () => {
                    showInputEditMessage(socket, chat, inputEdit);
                });
            } else if (action === "update" || action === "deleted") {
                if (!chat.updateMessage(message)) {
                    Notify.error('Un message vient d\'être édité et n\'a pu être synchronisé. Veuillez raffraîchir la page actuelle.');
                }
            }
        });

        socket.on('disconnect', () => {
            /*    setTimeout(() => {
                    window.location = '/se-deconnecter';
                }, 3000);*/
        });
    }
}
import "../../css/App.css";
import "../../css/utilities.css";
import "../../css/Home.css";

import { useRef } from "react";
import Tippy from "@tippyjs/react";
import { Icon } from "@iconify/react";
import "tippy.js/animations/scale.css";

// ! Pending Tasks :-
// ? if the user name is to big then give it a ... at the end
// ? if the recent chat user name is to big then give it a ... at the end
// ? create a dropdown for every recent chats 

function Home() {
    // useRef(s)
    let chatOperationsBox = useRef(null);

    // animations and page loader functions
    function loadProfilePage() {
        console.log("Loaded profile page")
    }
    function showChatOperationsOptions(chatOperationsBox) {
        chatOperationsBox = chatOperationsBox.current;

        if (chatOperationsBox.classList.contains("onclickScaleChatOperationBox")) {
            chatOperationsBox.classList.remove("onclickScaleChatOperationBox");
        } else {
            chatOperationsBox.classList.add("onclickScaleChatOperationBox");
        }
    }

    return (
        <>
            <nav className="alignCenter">
                <div className="favicon alignCenter">
                    <div className="logo">
                        <p className="appName">Chat App</p>
                        {/* <img src="/public/logo.png" loading="lazy" alt="LOGO..." /> <-- logo here */}
                    </div>
                </div>
                <Tippy
                    content="Visit Profile"
                    animation="scale"
                    duration={[250, 180]}
                    className="profile-tooltip"

                >
                    <div onClick={loadProfilePage} className="userProfile alignCenter">
                        <div className="avatar center">
                            <img src="src\assets\avatar.webp" loading="lazy" alt="Avatar..." />
                        </div>
                        <div className="userFullName">
                            <p>Ankit mehra</p>
                        </div>
                        <div className="isOnlineStatusGreenDot"></div>
                    </div>
                </Tippy>
            </nav>
            <main>
                <aside id="chatListContainer">
                    <div className="chatListHead alignCenter">
                        <p className="chats-text">Chats</p>
                        <div className="alignCenter">
                            <Tippy
                                className="profile-tooltip"
                                content="Add Chat"
                                animation="scale"
                                duration={[250, 180]}
                                placement="bottom"
                            >
                                <button className="center" id="addChatButton"><img src="src/assets/add-user.png" loading="lazy" alt="Error!" /></button>
                            </Tippy>
                            <button
                                className="center"
                                id="chatOptionsButton"
                                onClick={() => showChatOperationsOptions(chatOperationsBox)}
                            >
                                <img src="src/assets/more.png" loading="lazy" alt="Error!" />
                            </button>
                            <div ref={chatOperationsBox} className="flex chatOperationsBox">
                                <ul>
                                    <li><button className="alignCenter chatOperationsButtons"><Icon icon="mdi:account-multiple-add-outline"></Icon>Create Group</button></li>
                                    <li><button className="alignCenter chatOperationsButtons"><Icon icon="mdi:checkbox-outline" className="iconifyIcons"></Icon>Select Chats</button></li>
                                    <li><button className="alignCenter chatOperationsButtons"><Icon icon="mdi:logout"></Icon>Log Out</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <ul className="chatList">
                        <li className="chat alignCenter">
                            <div className="center chatUserAvatar">
                                <img src="src/assets/avatar.webp" loading="lazy" alt="Avatar" />
                            </div>
                            <div className="chatInfo alignCenter">
                                <div className="chatInfoRight flex">
                                    <span className="chatUserFullname">Moksh Sachdeva</span>
                                    {/* last message icons for :- sticker, deleted message, photos */}
                                    {/* for groups:- show the name of the user who sent the last message */}
                                    <div className="alignCenter">
                                        <img className="lastMessageIcons" src="src/assets/message-sent.png" alt="" /><span className="alignCenter chatUserLastMessage">Bhai message to padh liya kar</span>
                                    </div>
                                </div>
                                <div className="chatInfoLeft">
                                    <span className="lastChatDate">27/11/2025</span> {/*Format :- DD/MM/YYYY */}
                                </div>
                            </div>
                        </li>
                        <li className="chat alignCenter">
                            <div className="center chatUserAvatar">
                                <img src="src/assets/avatar.webp" loading="lazy" alt="Avatar" />
                            </div>
                            <div className="chatInfo alignCenter">
                                <div className="chatInfoRight flex">
                                    <span className="chatUserFullname">Kartikey</span>
                                    {/* last message icons for :- sticker, deleted message, photos */}
                                    {/* for groups:- show the name of the user who sent the last message */}
                                    <div className="alignCenter">
                                        <img className="lastMessageIcons" src="src/assets/message-read-blue.png" alt="" />
                                        <span className="alignCenter chatUserLastMessage">Bhai kya kar raha hai aajkal</span>
                                    </div>
                                </div>
                                <div className="chatInfoLeft">
                                    <span className="lastChatDate">27/11/2025</span> {/*Format :- DD/MM/YYYY */}
                                </div>
                            </div>
                        </li>
                        <li className="chat alignCenter">
                            <div className="center chatUserAvatar">
                                <img src="src/assets/avatar.webp" loading="lazy" alt="Avatar" />
                            </div>
                            <div className="chatInfo alignCenter">
                                <div className="chatInfoRight flex">
                                    <span className="chatUserFullname">Aryan</span>
                                    {/* last message icons for :- sticker, deleted message, photos */}
                                    {/* for groups:- show the name of the user who sent the last message */}
                                    <div className="alignCenter">
                                        <img className="lastMessageIcons" src="src/assets/message-read-blue.png" alt="" />
                                        <span className="alignCenter chatUserLastMessage">Meri notebook leerwerwerwer aio</span>
                                    </div>
                                </div>
                                <div className="chatInfoLeft">
                                    <span className="lastChatDate">27/09/2025</span> {/*Format :- DD/MM/YYYY */}
                                </div>
                            </div>
                        </li>
                    </ul>
                </aside>
            </main>
        </>
    )
}

export default Home;
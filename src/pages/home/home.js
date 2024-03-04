import { useNavigate } from 'react-router-dom';
import './home.css';
import { BsSendFill } from 'react-icons/bs';
import { useContext, useEffect, useState } from 'react';
import StateContext from '../../context/context.context';
import instance from '../../axios/instance';
import { changeChatRoom, changeRoom, getDataOtherUser, getDataUser } from '../../context/action.context';
import { io } from 'socket.io-client';
import severURL from '../../constant/severUrl';
import { socket } from '../../socket';

function Home() {
    const [state, dispatchState] = useContext(StateContext);
    const [messageState, setMessageState] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        console.log(messageState);
    }, [messageState]);

    useEffect(() => {
        if (!state.login) navigate('/login');
    }, [state]);
    // Call Api
    useEffect(() => {
        if (state.login) {
            instance
                .post('/get-all', { currentUsername: state.userData.username })
                .then((response) => {
                    if (response.status === 200) {
                        dispatchState(getDataOtherUser(response.data));
                    }
                })

                .catch((e) => {
                    console.log(e);
                });
            // Socket event
            socket.emit('online', { usernameOnline: state.userData.username });
        }
    }, [state.login]);
    // Received Message
    useEffect(() => {
        if (state.login) {
            socket.on('recieved-message', (data) => {
                console.log(data);
                setMessageState([...messageState, data]);
            });
        }
    });

    const handleChangeRoom = (event, user) => {
        event.preventDefault();
        event.stopPropagation();
        console.log(user);
        dispatchState(changeChatRoom(user));
    };

    const handleSendMessage = (e) => {
        if (!e.shiftKey) {
            if (e.key === 'Enter') {
                let tempMessage = messageInput;
                tempMessage.trim();
                if (tempMessage.length != 0) {
                    socket.emit('send-message', {
                        targetUser: state.roomChat.username,
                        message: tempMessage,
                        sender: state.userData.username,
                    });
                    const temp = {
                        sender: state.userData.username,
                        message: tempMessage,
                    };
                    setMessageState([...messageState, temp]);
                    setMessageInput('');
                }
            }
        } else if (e.type === 'click') {
            let tempMessage = messageInput;
            tempMessage.trim();
            if (tempMessage.length != 0) {
                socket.emit('send-message', {
                    targetUser: state.roomChat.username,
                    message: tempMessage,
                    sender: state.userData.username,
                });
                const temp = {
                    sender: state.userData.username,
                    message: tempMessage,
                };
                setMessageState([...messageState, temp]);
                setMessageInput('');
            }
        }
    };

    const handleChangeInput = (event) => {
        setMessageInput(event.target.value);
    };

    return (
        <div className="home-wrapper">
            <nav className="navbar-container"></nav>
            <div className="home-content-container">
                <div className="chat-side-bar-container">
                    {state.otherUserData?.map((item, key) => {
                        return (
                            <div className="chat-user" key={key} onClick={(event) => handleChangeRoom(event, item)}>
                                <img src="image/avt.jpg" className="chat-avt-user" />
                                <div className="chat-preview-container">
                                    <span className="chat-preview-name">{item.name}</span>
                                    <span className="chat-preview-mess">Hello</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="chat-container">
                    {/* Chat */}
                    <div className="chat-content-container">
                        {messageState?.map((data, index) => {
                            return data.sender === state.userData.username ? (
                                <div className="sender-user-chat-container" key={index}>
                                    <div className="sender-user-chat-container">
                                        <span className="message">{data.message}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="target-user-chat-container" key={index}>
                                    <img src="image/avt.jpg" className="chat-avt-user" />
                                    <div className="target-message-container">
                                        <span className="message">{data.message}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="chat-footer">
                        <div className=""></div>
                        <div className="chat-input-container">
                            <textarea
                                placeholder="Aa"
                                className="message-input-container"
                                value={messageInput}
                                onChange={(e) => handleChangeInput(e)}
                                onKeyDown={(e) => handleSendMessage(e)}
                            ></textarea>
                            <div className="chat-send-icon-container" onClick={handleSendMessage}>
                                <BsSendFill style={{ margin: 'auto' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;

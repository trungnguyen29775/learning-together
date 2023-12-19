import './home.css';
import { BsSendFill } from 'react-icons/bs';

function Home() {
    return (
        <div className="home-wrapper">
            <nav className="navbar-container"></nav>
            <div className="home-content-container">
                <div className="chat-side-bar-container">
                    {[1, 1, 1, 1, 1, 1].map((item, key) => {
                        return (
                            <div className="chat-user" key={key}>
                                <img src="image/avt.jpg" className="chat-avt-user" />
                                <div className="chat-preview-container">
                                    <span className="chat-preview-name">Trung Nguyễn</span>
                                    <span className="chat-preview-mess">Hello</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="chat-container">
                    {/* Chat */}

                    <div className="chat-content-container">
                        <div className="target-user-chat-container">
                            <img src="image/avt.jpg" className="chat-avt-user" />
                            <div className="target-message-container">
                                <span className="message">Hello, toi la con bo</span>
                                <span className="message">Hehe</span>
                            </div>
                        </div>

                        <div className="sender-user-chat-container">
                            <div className="sender-user-chat-container">
                                <span className="message">Hello, toi la con bo</span>
                                <span className="message">Hehe</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="chat-footer">
                        <div className=""></div>
                        <div className="chat-input-container">
                            <textarea placeholder="Aa" className="message-input-container"></textarea>
                            <div className="chat-send-icon-container">
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

import { useEffect } from 'react';
import './notify.css';
import { ImCross } from 'react-icons/im';

function Notify(props) {
    useEffect(() => {
        console.log(props);
    }, [props]);

    const handelClick = (event) => {
        event.stopPropagation();
        const notifyContainer = event.target.closest('.notify-wrapper');
        notifyContainer.classList.add('hide');
        console.log(notifyContainer);
    };
    return (
        <div className="notify-wrapper">
            <div className="notify-content-container">
                <span className="notify-content-container__span">{props.message}</span>
                <button className="notify-close-button" onClick={(e) => handelClick(e)}>
                    <ImCross />
                </button>
            </div>
        </div>
    );
}

export default Notify;

import React, {PureComponent} from 'react';
import Icon from "./Icon";
import moment from "moment";
import Loading from "../Loading";

class Forum extends PureComponent {
    constructor(props) {
        super(props);
        this.messageInput = React.createRef();
        this.messageArea = React.createRef();
        this.state = {
            messages: null,
            messageAreaScrolled: false
        };
        this.socket = this.props.socket;
        this.handleSocketGetAllMessages = this.handleSocketGetAllMessages.bind(this);
        this.handleSocketNewSubmission = this.handleSocketNewSubmission.bind(this);
        this.messageAreaOnScrollHandler = this.messageAreaOnScrollHandler.bind(this);
        this.throttle = this.throttle.bind(this);
    }

    componentDidUpdate() {
        this.props.swipeAdjustHeight();
    }

    componentWillUnmount() {
        // remove eventhandlers
    }

    componentDidMount() {
        this.socket.emit('forum-get-all-by-id', this.props.topicId);
        this.socket.on('forum-get-all-by-id-result', this.handleSocketGetAllMessages);
        this.socket.on('forum-new-submission', this.handleSocketNewSubmission);
    }

    throttle (func, wait, options) {
        let context;
        let args;
        let result;
        let timeout = null;
        let previous = 0;
        if (!options) options = {};
        const later = () => {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            const now = Date.now();
            if (!previous && options.leading === false) previous = now;
            const remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    handleSocketGetAllMessages(messages) {
        console.log(messages);
        this.setState({
            messages: messages ? messages : "empty"
        }, () => {
            this.messageArea.current.scrollTop = this.messageArea.current.scrollHeight
        })
    }

    messageAreaOnScrollHandler() {
        const {scrollHeight, clientHeight, scrollTop}  = this.messageArea.current;
        //console.log(scrollHeight, clientHeight, scrollTop, scrollHeight - clientHeight <= scrollTop);
        if (scrollHeight - clientHeight <= scrollTop) {
            this.setState({
                messageAreaScrolled: true
            })
        }
    }

    handleSocketNewSubmission(message) {
        console.log(message);
        this.setState({
            messages: [...this.state.messages, message]
        }, () => {
           // if (this.state.messageAreaScrolled)
        });
    }

    messageSubmit() {
        const data = {
            topicId: this.props.topicId,
            message: this.messageInput.current.value,
            date: moment(),
            user: 'Anonymous'
        };
        this.socket.emit('forum-post-new', data);
    }

    textAreaKeyUp() {
        this.messageInput.current.style.height = '40px';
        this.messageInput.current.style.height = this.messageInput.current.scrollHeight + 'px'
    }

    render() {
        const {messages} = this.state;
        console.log(messages);
        if (!messages) return <Loading type="inside"/>;

        return (
            <div className="forum container">
                <div className="white-box mt-2">
                    <div className="messages-area" ref={this.messageArea} onScroll={this.throttle(this.messageAreaOnScrollHandler, 350, {leading: false, trailing: true})}>
                        <ul>
                            {this.state.messages === "empty" ? (<li>Mesaj yok!</li>) :
                                this.state.messages.map((message, index) =>
                                    <li key={index}>
                                        <strong>{message.user}</strong>
                                        {message.message}
                                        <time>{moment(message.date).format('HH:ss')}</time>
                                    </li>
                                )}
                        </ul>
                    </div>
                    <div className="text-area">
                        <textarea ref={this.messageInput} placeholder="Mesajınızı yazın" rows="1" style={{height: 40}}
                                  onKeyUp={this.textAreaKeyUp.bind(this)}/>
                        <button onClick={this.messageSubmit.bind(this)}><Icon name="fa fa-paper-plane"/></button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Forum

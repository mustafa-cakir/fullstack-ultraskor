import React, {PureComponent} from 'react';
import Icon from "./Icon";
import moment from "moment";
import Loading from "./Loading";
import {Trans} from "react-i18next";

class Forum extends PureComponent {
    constructor(props) {
        super(props);
        this.messageInput = React.createRef();
        this.messageArea = React.createRef();
        this.userNameInputField = React.createRef();
        this.state = {
            messages: null,
            messageAreaScrolled: false,
            textAreaFilled: false,
            userName: null,
            showuserNameModal: false,
            userNameFieldError: false
        };
        this.socket = this.props.socket;
        this.handleSocketGetAllMessages = this.handleSocketGetAllMessages.bind(this);
        this.handleSocketNewSubmission = this.handleSocketNewSubmission.bind(this);
        this.textAreaKeyPress = this.textAreaKeyPress.bind(this);
        this.textAreaChange = this.textAreaChange.bind(this);
        this.userNameKeyPress = this.userNameKeyPress.bind(this);
        this.textAreaFocused = this.textAreaFocused.bind(this);
        this.userNameSave = this.userNameSave.bind(this);
    }

    componentDidUpdate() {
        this.props.swipeAdjustHeight();
    }

    componentWillUnmount() {
        this.socket.removeListener('forum-get-all-by-id-result', this.handleSocketGetAllMessages);
        this.socket.removeListener('forum-new-submission', this.handleSocketNewSubmission);
    }

    componentDidMount() {
        let storageUserName = localStorage.getItem('UltraSkorForumUserName');
        if (storageUserName) this.setState({userName: storageUserName});

        this.socket.emit('forum-get-all-by-id', this.props.topicId);
        this.socket.on('forum-get-all-by-id-result', this.handleSocketGetAllMessages);
        this.socket.on('forum-new-submission', this.handleSocketNewSubmission);
    }

    handleSocketGetAllMessages(messages) {
        this.setState({
            messages: messages ? messages.reverse() : ""
        })
    }

    handleSocketNewSubmission(message) {
        if (message.topicId === this.props.topicId) {
            this.setState({
                messages: [...this.state.messages.reverse(), message].reverse()
            });
        }
    }

    messageSubmit(e) {
        if (!this.state.textAreaFilled) return false;
        e.preventDefault();
        const data = {
            topicId: this.props.topicId,
            message: this.messageInput.current.value,
            date: moment(),
            userName: this.state.userName
        };
        this.messageInput.current.value = "";
        this.socket.emit('forum-post-new', data);
    }

    textAreaChange(e) {
        this.setState({textAreaFilled: e.target.value.length > 0});
        this.messageInput.current.style.height = '40px';
        this.messageInput.current.style.height = this.messageInput.current.scrollHeight + 'px'
    }

    textAreaKeyPress(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.messageSubmit(e);
        }
    }

    userNameKeyPress(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.userNameSave(e);
        }
    }

    userNameSave() {
        let userName = this.userNameInputField.current.value;
        if (userName && userName.length > 3) {
            this.setState({
                showuserNameModal: false,
                userName: userName
            }, () => {
                localStorage.setItem('UltraSkorForumUserName', userName);
            })
        } else {
            this.setState({
                userNameFieldError: true
            })
        }
    }

    textAreaFocused(e) {
        if (!this.state.userName) {
            e.preventDefault();
            this.setState({showuserNameModal: true}, () => {
                this.userNameInputField.current.focus();
            });
        }
    }

    render() {
        const {t} = this.props;
        const {messages, textAreaFilled, showuserNameModal, userName, userNameFieldError} = this.state;
        if (!messages) return <Loading type="inside"/>;

        return (
            <div className="forum container">
                <div className="white-box mt-2">
                    <div className="modalShadow" style={{display: showuserNameModal ? "block" : "none"}}/>
                    <div className={"modal fade" + (showuserNameModal ? " show" : "")} tabIndex="-1"
                         style={{display: showuserNameModal ? "block" : "none"}}>
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title"><Trans>Enter Your Name</Trans></h5>
                                    <button type="button" className="close" onClick={() => {
                                        this.setState({showuserNameModal: false})
                                    }}>
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p><Trans>Please enter your name or a nickname to label your messages in the
                                        forum</Trans></p>
                                    <input
                                        type="text"
                                        className="form-control"
                                        ref={this.userNameInputField}
                                        placeholder={t("Enter Your Name")}
                                        defaultValue={userName}
                                        onKeyDown={this.userNameKeyPress}/>
                                    <div className="invalid-feedback"
                                         style={{display: userNameFieldError ? "block" : "none"}}>
                                        <Trans>Please enter a valid name</Trans>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        data-dismiss="modal"
                                        onClick={() => {
                                            this.setState({showuserNameModal: false})
                                        }}><Trans>Close</Trans>
                                    </button>
                                    <button type="submit" className="btn btn-primary" onClick={this.userNameSave}>
                                        <Trans>Save</Trans></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-area">
                        <form className="row" onSubmit={this.messageSubmit.bind(this)}>
                            <div className="col col-userName" onClick={() => {
                                this.setState({showuserNameModal: true}, () => {
                                    this.userNameInputField.current.focus();
                                });
                            }}>
                                <div className="userName">{userName ? userName.substring(0, 1) :
                                    <Icon name="fas fa-question"/>}</div>
                            </div>
                            <div className="col col-textarea">
                            <textarea
                                ref={this.messageInput}
                                placeholder={userName ? t('Enter Your Message') : t('Enter Your Name')}
                                rows="1"
                                style={{height: 40}}
                                onKeyDown={this.textAreaKeyPress}
                                onChange={this.textAreaChange}
                                onFocus={this.textAreaFocused}/>
                            </div>
                            <div className="col col-submit">
                                <button type="submit" className={textAreaFilled ? "filled" : ""}><Icon
                                    name="fa fa-paper-plane"/></button>
                            </div>
                        </form>
                    </div>
                    <div className="messages-area" ref={this.messageArea}>
                        {messages.length > 0 ? (
                            <ul>
                                {messages.map((message, index) =>
                                    <li key={index}>
                                        <div className={"li-container" + (message.userName === userName ? " mine" : "")}>
                                            <strong>{message.userName}</strong>
                                            {message.message}
                                            <time>
                                                {moment(message.date).isSame(moment(), 'day') ? moment(message.date).format('HH:mm') : moment(message.date).format('DD MMM, HH:mm')}
                                                </time>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <React.Fragment>
                                <div className="bubble"><span><Trans>No message has yet been posted</Trans></span></div>
                                <div className="bubble"><span><Trans>Be the first one</Trans> ;)</span></div>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default Forum

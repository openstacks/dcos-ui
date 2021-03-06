import { Confirm } from "reactjs-components";
import { routerShape } from "react-router";
import PureRender from "react-addons-pure-render-mixin";
import React, { PropTypes } from "react";
import { injectIntl, intlShape } from "react-intl";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

import AppLockedMessage from "./AppLockedMessage";
import Framework from "../../structs/Framework";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

// This needs to be at least equal to @modal-animation-duration
const REDIRECT_DELAY = 300;
const METHODS_TO_BIND = [
  "handleChangeInputFieldDestroy",
  "handleModalClose",
  "handleRightButtonClick",
  "handleFormSubmit"
];

class ServiceDestroyModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      errorMsg: null,
      serviceNameConfirmationValue: ""
    };

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.redirectToServices();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { errors } = nextProps;
    if (!errors) {
      this.setState({ errorMsg: null });

      return;
    }

    if (typeof errors === "string") {
      this.setState({ errorMsg: errors });

      return;
    }

    let { message: errorMsg = "", details } = errors;
    const hasDetails = details && details.length !== 0;

    if (hasDetails) {
      errorMsg = details.reduce(function(memo, error) {
        return `${memo} ${error.errors.join(" ")}`;
      }, "");
    }

    if (!errorMsg || !errorMsg.length) {
      errorMsg = null;
    }

    this.setState({ errorMsg });
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  handleModalClose() {
    this.setState({ serviceNameConfirmationValue: "" });
    this.props.onClose();
  }

  handleRightButtonClick() {
    if (!this.getIsRightButtonDisabled()) {
      this.props.deleteItem(this.shouldForceUpdate());
      this.setState({ serviceNameConfirmationValue: "" });
    }
  }

  handleChangeInputFieldDestroy(event) {
    this.setState({
      serviceNameConfirmationValue: event.target.value
    });
  }

  handleFormSubmit(event) {
    event.preventDefault();
    this.handleRightButtonClick();
  }

  getIsRightButtonDisabled() {
    return (
      this.props.service.getName() !== this.state.serviceNameConfirmationValue
    );
  }

  getErrorMessage() {
    const { errorMsg = null } = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage service={this.props.service} />;
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  redirectToServices() {
    const { router } = this.context;

    // Close the modal and redirect after the close animation has completed
    this.handleModalClose();
    setTimeout(() => {
      router.push({ pathname: "/services/overview" });
    }, REDIRECT_DELAY);
  }

  getServiceDeleteForm() {
    const { service } = this.props;
    const serviceName = service.getName();
    const serviceLabel = this.getServiceLabel();

    return (
      <div className="modal-service-delete-center">
        <p>
          This action
          {" "}
          <strong>CANNOT</strong>
          {" "}
          be undone. This will permanently delete the
          {" "}
          <strong>{serviceName}</strong>
          {" "}
          {serviceLabel.toLowerCase()}
          .
        </p>
        <p>
          Type ("
          <strong>{serviceName}</strong>
          ") below to confirm you want to delete the
          {" "}
          {serviceLabel.toLowerCase()}.
        </p>
        <input
          className="form-control filter-input-text"
          onChange={this.handleChangeInputFieldDestroy}
          type="text"
          value={this.state.serviceNameConfirmationValue}
          autoFocus
        />
      </div>
    );
  }

  getDestroyServiceModal() {
    const { open } = this.props;
    const serviceLabel = this.getServiceLabel();
    const itemText = `${StringUtil.capitalize(UserActions.DELETE)} ${serviceLabel}`;

    return (
      <Confirm
        disabled={this.getIsRightButtonDisabled()}
        header={this.getModalHeading()}
        open={open}
        onClose={this.handleModalClose}
        leftButtonText="Cancel"
        leftButtonCallback={this.handleModalClose}
        rightButtonText={itemText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleRightButtonClick}
        showHeader={true}
      >
        <form onSubmit={this.handleFormSubmit}>
          {this.getServiceDeleteForm()}
          {this.getErrorMessage()}
        </form>
      </Confirm>
    );
  }

  getModalHeading() {
    const serviceLabel = this.getServiceLabel();

    return (
      <ModalHeading className="text-danger">
        {StringUtil.capitalize(UserActions.DELETE)} {serviceLabel}
      </ModalHeading>
    );
  }

  getSubHeader() {
    if (!this.props.subHeaderContent) {
      return null;
    }

    return (
      <p className="text-align-center flush-bottom">
        {this.props.subHeaderContent}
      </p>
    );
  }

  getServiceLabel() {
    const { service } = this.props;

    if (service instanceof Pod) {
      return "Pod";
    }

    if (service instanceof ServiceTree) {
      return "Group";
    }

    return "Service";
  }

  render() {
    return this.getDestroyServiceModal();
  }
}

ServiceDestroyModal.contextTypes = {
  router: routerShape
};

ServiceDestroyModal.propTypes = {
  deleteItem: PropTypes.func.isRequired,
  errors: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  intl: intlShape.isRequired,
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(Framework),
    PropTypes.instanceOf(Pod),
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = injectIntl(ServiceDestroyModal);

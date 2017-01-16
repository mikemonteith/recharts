import _isFunction from 'lodash/isFunction';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview Tooltip
 */
import React, { Component, PropTypes } from 'react';
import Animate from 'react-smooth';

import DefaultTooltipContent from './DefaultTooltipContent';
import { getStyleString } from '../util/DOMUtils';
import { isSsr } from '../util/ReactUtils';
import { isNumOrStr, isNumber } from '../util/DataUtils';

var propTypes = {
  content: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  viewBox: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
  }),

  active: PropTypes.bool,
  separator: PropTypes.string,
  formatter: PropTypes.func,
  offset: PropTypes.number,

  itemStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
  cursor: PropTypes.oneOfType([PropTypes.bool, PropTypes.element, PropTypes.object]),

  coordinate: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),

  label: PropTypes.any,
  payload: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.any,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unit: PropTypes.any
  })),

  isAnimationActive: PropTypes.bool,
  animationDuration: PropTypes.number,
  animationEasing: PropTypes.oneOf(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
  itemSorter: PropTypes.func
};

var defaultProps = {
  active: false,
  offset: 10,
  viewBox: { x1: 0, x2: 0, y1: 0, y2: 0 },
  coordinate: { x: 0, y: 0 },
  cursorStyle: {},
  separator: ' : ',
  wrapperStyle: {},
  itemStyle: {},
  labelStyle: {},
  cursor: true,
  isAnimationActive: !isSsr(),
  animationEasing: 'ease',
  animationDuration: 400,
  itemSorter: function itemSorter() {
    return -1;
  }
};

var renderContent = function renderContent(content, props) {
  if (React.isValidElement(content)) {
    return React.cloneElement(content, props);
  } else if (_isFunction(content)) {
    return content(props);
  }

  return React.createElement(DefaultTooltipContent, props);
};

var Tooltip = (_temp = _class = function (_Component) {
  _inherits(Tooltip, _Component);

  function Tooltip() {
    _classCallCheck(this, Tooltip);

    return _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).apply(this, arguments));
  }

  _createClass(Tooltip, [{
    key: 'getBBox',
    value: function getBBox() {
      if (!this.wrapperNode) {
        return null;
      }

      return this.wrapperNode.getBoundingClientRect ? this.wrapperNode.getBoundingClientRect() : null;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          payload = _props.payload,
          isAnimationActive = _props.isAnimationActive,
          animationDuration = _props.animationDuration,
          animationEasing = _props.animationEasing;

      var hasPayload = payload && payload.length && payload.filter(function (entry) {
        return isNumOrStr(entry.value);
      }).length;
      var _props2 = this.props,
          content = _props2.content,
          viewBox = _props2.viewBox,
          coordinate = _props2.coordinate,
          position = _props2.position,
          active = _props2.active,
          offset = _props2.offset,
          wrapperStyle = _props2.wrapperStyle;

      var outerStyle = _extends({
        pointerEvents: 'none',
        visibility: active && hasPayload ? 'visible' : 'hidden',
        position: 'absolute',
        top: 0
      }, wrapperStyle);
      var translateX = void 0,
          translateY = void 0;

      if (position && isNumber(position.x) && isNumber(position.y)) {
        translateX = position.x;
        translateY = position.y;
      } else {
        var box = this.getBBox();

        if (box && coordinate) {
          translateX = position && isNumber(position.x) ? position.x : Math.max(coordinate.x + box.width + offset > viewBox.x + viewBox.width ? coordinate.x - box.width - offset : coordinate.x + offset, viewBox.x);

          translateY = position && isNumber(position.y) ? position.y : Math.max(coordinate.y + box.height + offset > viewBox.y + viewBox.height ? coordinate.y - box.height - offset : coordinate.y + offset, viewBox.y);
        } else {
          outerStyle.visibility = 'hidden';
        }
      }

      return React.createElement(
        Animate,
        {
          from: 'translate(' + translateX + 'px, ' + translateY + 'px)',
          to: 'translate(' + translateX + 'px, ' + translateY + 'px)',
          duration: animationDuration,
          isActive: outerStyle.visibility === 'visible',
          easing: animationEasing,
          attributeName: 'transform'
        },
        React.createElement(
          'div',
          {
            className: 'recharts-tooltip-wrapper',
            style: outerStyle,
            ref: function ref(node) {
              _this2.wrapperNode = node;
            }
          },
          renderContent(content, this.props)
        )
      );
    }
  }]);

  return Tooltip;
}(Component), _class.displayName = 'Tooltip', _class.propTypes = propTypes, _class.defaultProps = defaultProps, _temp);


export default Tooltip;
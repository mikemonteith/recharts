import _isFunction from 'lodash/isFunction';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @fileOverview Legend
 */
import React, { Component, PropTypes } from 'react';

import pureRender from '../util/PureRender';
import DefaultLegendContent from './DefaultLegendContent';
import { getStyleString } from '../util/DOMUtils';
import { isNumber } from '../util/DataUtils';

var renderContent = function renderContent(content, props) {
  if (React.isValidElement(content)) {
    return React.cloneElement(content, props);
  } else if (_isFunction(content)) {
    return content(props);
  }

  return React.createElement(DefaultLegendContent, props);
};

var Legend = pureRender(_class = (_temp = _class2 = function (_Component) {
  _inherits(Legend, _Component);

  function Legend() {
    _classCallCheck(this, Legend);

    return _possibleConstructorReturn(this, (Legend.__proto__ || Object.getPrototypeOf(Legend)).apply(this, arguments));
  }

  _createClass(Legend, [{
    key: 'getBBox',
    value: function getBBox() {
      if (!this.wrapperNode) {
        return null;
      }

      return this.wrapperNode.getBoundingClientRect ? this.wrapperNode.getBoundingClientRect() : null;
    }
  }, {
    key: 'getDefaultPosition',
    value: function getDefaultPosition(style) {
      var _props = this.props,
          layout = _props.layout,
          align = _props.align,
          verticalAlign = _props.verticalAlign,
          margin = _props.margin,
          chartWidth = _props.chartWidth,
          chartHeight = _props.chartHeight;

      var hPos = void 0,
          vPos = void 0;

      if (!style || (style.left === undefined || style.left === null) && (style.right === undefined || style.right === null)) {
        if (align === 'center' && layout === 'vertical') {
          var box = this.getBBox() || { width: 0 };
          hPos = { left: ((chartWidth || 0) - box.width) / 2 };
        } else {
          hPos = align === 'right' ? { right: margin && margin.right || 0 } : { left: margin && margin.left || 0 };
        }
      }

      if (!style || (style.top === undefined || style.top === null) && (style.bottom === undefined || style.bottom === null)) {
        if (verticalAlign === 'middle') {
          var _box = this.getBBox() || { height: 0 };
          vPos = { top: ((chartHeight || 0) - _box.height) / 2 };
        } else {
          vPos = verticalAlign === 'bottom' ? { bottom: margin && margin.bottom || 0 } : { top: margin && margin.top || 0 };
        }
      }

      return _extends({}, hPos, vPos);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props2 = this.props,
          content = _props2.content,
          width = _props2.width,
          height = _props2.height,
          wrapperStyle = _props2.wrapperStyle;

      var outerStyle = _extends({
        position: 'absolute',
        width: width || 'auto',
        height: height || 'auto'
      }, this.getDefaultPosition(wrapperStyle), wrapperStyle);

      return React.createElement(
        'div',
        {
          className: 'recharts-legend-wrapper',
          style: outerStyle,
          ref: function ref(node) {
            _this2.wrapperNode = node;
          }
        },
        renderContent(content, this.props)
      );
    }
  }], [{
    key: 'getWithHeight',
    value: function getWithHeight(item, chartWidth) {
      var layout = item.props.layout;


      if (layout === 'vertical' && isNumber(item.props.height)) {
        return {
          height: item.props.height
        };
      } else if (layout === 'horizontal') {
        return {
          width: item.props.width || chartWidth
        };
      }

      return null;
    }
  }]);

  return Legend;
}(Component), _class2.displayName = 'Legend', _class2.propTypes = {
  content: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  wrapperStyle: PropTypes.object,
  chartWidth: PropTypes.number,
  chartHeight: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  iconSize: PropTypes.number,
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  align: PropTypes.oneOf(['center', 'left', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'bottom', 'middle']),
  margin: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    bottom: PropTypes.number,
    right: PropTypes.number
  }),
  payload: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any,
    id: PropTypes.any,
    type: PropTypes.oneOf(['line', 'square', 'rect', 'circle', 'cross', 'diamond', 'star', 'triangle', 'wye'])
  })),
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onClick: PropTypes.func
}, _class2.defaultProps = {
  iconSize: 14,
  layout: 'horizontal',
  align: 'center',
  verticalAlign: 'bottom'
}, _temp)) || _class;

export default Legend;
import _isFunction from 'lodash/isFunction';
import _sumBy from 'lodash/sumBy';
import _min from 'lodash/min';
import _maxBy from 'lodash/maxBy';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @file TreemapChart
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import Surface from '../container/Surface';
import Layer from '../container/Layer';
import Tooltip from '../component/Tooltip';
import Rectangle from '../shape/Rectangle';
import pureRender, { shallowEqual } from '../util/PureRender';
import { PRESENTATION_ATTRIBUTES, getPresentationAttributes, EVENT_ATTRIBUTES, filterSvgElements, validateWidthHeight, findChildByType } from '../util/ReactUtils';
import { getValueByDataKey } from '../util/DataUtils';

var defaultCoordinateOfTooltip = { x: 0, y: 0 };

var interpolationGenerator = function interpolationGenerator(a, b) {
  var ka = +a;
  var kb = b - ka;
  return function (t) {
    return ka + kb * t;
  };
};
var centerY = function centerY(node) {
  return node.y + node.dy / 2;
};
var getValue = function getValue(entry) {
  return entry && entry.value || 0;
};
var getSumOfIds = function getSumOfIds(links, ids) {
  return ids.reduce(function (result, id) {
    return result + getValue(links[id]);
  }, 0);
};
var getSumWithWeightedSource = function getSumWithWeightedSource(tree, links, ids) {
  return ids.reduce(function (result, id) {
    var link = links[id];
    var sourceNode = tree[link.source];

    return result + centerY(sourceNode) * getValue(links[id]);
  }, 0);
};
var getSumWithWeightedTarget = function getSumWithWeightedTarget(tree, links, ids) {
  return ids.reduce(function (result, id) {
    var link = links[id];
    var targetNode = tree[link.target];

    return result + centerY(targetNode) * getValue(links[id]);
  }, 0);
};
var ascendingY = function ascendingY(a, b) {
  return a.y - b.y;
};

var searchTargetsAndSources = function searchTargetsAndSources(links, id) {
  var sourceNodes = [];
  var sourceLinks = [];
  var targetNodes = [];
  var targetLinks = [];

  for (var i = 0, len = links.length; i < len; i++) {
    var link = links[i];

    if (link.source === id) {
      targetNodes.push(link.target);
      targetLinks.push(i);
    }

    if (link.target === id) {
      sourceNodes.push(link.source);
      sourceLinks.push(i);
    }
  }

  return { sourceNodes: sourceNodes, sourceLinks: sourceLinks, targetLinks: targetLinks, targetNodes: targetNodes };
};

var updateDepthOfTargets = function updateDepthOfTargets(tree, curNode) {
  var targetNodes = curNode.targetNodes;

  for (var i = 0, len = targetNodes.length; i < len; i++) {
    var target = tree[targetNodes[i]];

    if (target) {
      target.depth = Math.max(curNode.depth + 1, target.depth);

      updateDepthOfTargets(tree, target);
    }
  }
};

var getNodesTree = function getNodesTree(_ref, width, nodeWidth) {
  var nodes = _ref.nodes,
      links = _ref.links;

  var tree = nodes.map(function (entry, index) {
    var result = searchTargetsAndSources(links, index);

    return _extends({}, entry, result, {
      value: Math.max(getSumOfIds(links, result.sourceLinks), getSumOfIds(links, result.targetLinks)),
      depth: 0
    });
  });

  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];

    if (!node.sourceNodes.length) {
      updateDepthOfTargets(tree, node);
    }
  }
  var maxDepth = _maxBy(tree, function (entry) {
    return entry.depth;
  }).depth;

  if (maxDepth >= 1) {
    var childWidth = (width - nodeWidth) / maxDepth;
    for (var _i = 0, _len = tree.length; _i < _len; _i++) {
      var _node = tree[_i];

      if (!_node.targetNodes.length) {
        _node.depth = maxDepth;
      }
      _node.x = _node.depth * childWidth;
      _node.dx = nodeWidth;
    }
  }

  return { tree: tree, maxDepth: maxDepth };
};

var getDepthTree = function getDepthTree(tree) {
  var result = [];

  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];

    if (!result[node.depth]) {
      result[node.depth] = [];
    }

    result[node.depth].push(node);
  }

  return result;
};

var updateYOfTree = function updateYOfTree(depthTree, height, nodePadding, links) {
  var yRatio = _min(depthTree.map(function (nodes) {
    return (height - (nodes.length - 1) * nodePadding) / _sumBy(nodes, getValue);
  }));

  for (var d = 0, maxDepth = depthTree.length; d < maxDepth; d++) {
    for (var i = 0, len = depthTree[d].length; i < len; i++) {
      var node = depthTree[d][i];

      node.y = i;
      node.dy = node.value * yRatio;
    }
  }

  return links.map(function (link) {
    return _extends({}, link, { dy: getValue(link) * yRatio });
  });
};

var resolveCollisions = function resolveCollisions(depthTree, height, nodePadding) {
  for (var i = 0, len = depthTree.length; i < len; i++) {
    var nodes = depthTree[i];
    var n = nodes.length;

    // Sort by the value of y
    nodes.sort(ascendingY);

    var y0 = 0;
    for (var j = 0; j < n; j++) {
      var node = nodes[j];
      var dy = y0 - node.y;

      if (dy > 0) {
        node.y += dy;
      }

      y0 = node.y + node.dy + nodePadding;
    }

    y0 = height + nodePadding;
    for (var _j = n - 1; _j >= 0; _j--) {
      var _node2 = nodes[_j];
      var _dy = _node2.y + _node2.dy + nodePadding - y0;

      if (_dy > 0) {
        _node2.y -= _dy;
        y0 = _node2.y;
      } else {
        break;
      }
    }
  }
};

var relaxLeftToRight = function relaxLeftToRight(tree, depthTree, links, alpha) {
  for (var i = 0, maxDepth = depthTree.length; i < maxDepth; i++) {
    var nodes = depthTree[i];

    for (var j = 0, len = nodes.length; j < len; j++) {
      var node = nodes[j];

      if (node.sourceLinks.length) {
        var sourceSum = getSumOfIds(links, node.sourceLinks);
        var weightedSum = getSumWithWeightedSource(tree, links, node.sourceLinks);
        var y = weightedSum / sourceSum;

        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
var relaxRightToLeft = function relaxRightToLeft(tree, depthTree, links, alpha) {
  for (var i = depthTree.length - 1; i >= 0; i--) {
    var nodes = depthTree[i];

    for (var j = 0, len = nodes.length; j < len; j++) {
      var node = nodes[j];

      if (node.targetLinks.length) {
        var targetSum = getSumOfIds(links, node.targetLinks);
        var weightedSum = getSumWithWeightedTarget(tree, links, node.targetLinks);
        var y = weightedSum / targetSum;

        node.y += (y - centerY(node)) * alpha;
      }
    }
  }
};
var updateYOfLinks = function updateYOfLinks(tree, links) {
  for (var i = 0, len = tree.length; i < len; i++) {
    var node = tree[i];
    var sy = 0;
    var ty = 0;

    node.targetLinks.sort(function (a, b) {
      return tree[links[a].target].y - tree[links[b].target].y;
    });
    node.sourceLinks.sort(function (a, b) {
      return tree[links[a].source].y - tree[links[b].source].y;
    });

    for (var j = 0, tLen = node.targetLinks.length; j < tLen; j++) {
      var link = links[node.targetLinks[j]];

      if (link) {
        link.sy = sy;
        sy += link.dy;
      }
    }

    for (var _j2 = 0, sLen = node.sourceLinks.length; _j2 < sLen; _j2++) {
      var _link = links[node.sourceLinks[_j2]];

      if (_link) {
        _link.ty = ty;
        ty += _link.dy;
      }
    }
  }
};

var computeData = function computeData(_ref2) {
  var data = _ref2.data,
      width = _ref2.width,
      height = _ref2.height,
      iterations = _ref2.iterations,
      nodeWidth = _ref2.nodeWidth,
      nodePadding = _ref2.nodePadding;
  var links = data.links;

  var _getNodesTree = getNodesTree(data, width, nodeWidth),
      tree = _getNodesTree.tree;

  var depthTree = getDepthTree(tree);
  var newLinks = updateYOfTree(depthTree, height, nodePadding, links);

  resolveCollisions(depthTree, height, nodePadding);

  var alpha = 1;
  for (var i = 1; i <= iterations; i++) {
    relaxRightToLeft(tree, depthTree, newLinks, alpha *= 0.99);

    resolveCollisions(depthTree, height, nodePadding);

    relaxLeftToRight(tree, depthTree, newLinks, alpha);

    resolveCollisions(depthTree, height, nodePadding);
  }

  updateYOfLinks(tree, newLinks);

  return { nodes: tree, links: newLinks };
};

var getCoordinateOfTooltip = function getCoordinateOfTooltip(el, type) {
  if (type === 'node') {
    return { x: el.x + el.width / 2, y: el.y + el.height / 2 };
  }

  return {
    x: (el.sourceX + el.targetX) / 2,
    y: (el.sourceY + el.targetY) / 2
  };
};

var getPayloadOfTooltip = function getPayloadOfTooltip(el, type, nameKey) {
  var payload = el.payload;

  if (type === 'node') {
    return [{
      payload: el,
      name: getValueByDataKey(payload, nameKey, ''),
      value: getValueByDataKey(payload, 'value')
    }];
  }
  if (payload.source && payload.target) {
    var sourceName = getValueByDataKey(payload.source, nameKey, '');
    var targetName = getValueByDataKey(payload.target, nameKey, '');

    return [{
      payload: el,
      name: sourceName + ' - ' + targetName,
      value: getValueByDataKey(payload, 'value')
    }];
  }

  return [];
};

var Sankey = pureRender(_class = (_temp = _class2 = function (_Component) {
  _inherits(Sankey, _Component);

  function Sankey(props) {
    _classCallCheck(this, Sankey);

    var _this = _possibleConstructorReturn(this, (Sankey.__proto__ || Object.getPrototypeOf(Sankey)).call(this, props));

    _this.state = _this.createDefaultState(props);
    return _this;
  }

  _createClass(Sankey, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _props = this.props,
          data = _props.data,
          width = _props.width,
          height = _props.height,
          margin = _props.margin,
          iterations = _props.iterations,
          nodeWidth = _props.nodeWidth,
          nodePadding = _props.nodePadding,
          nameKey = _props.nameKey;

      if (nextProps.data !== data || nextProps.width !== width || nextProps.height !== height || !shallowEqual(nextProps.margin, margin) || nextProps.iterations !== iterations || nextProps.nodeWidth !== nodeWidth || nextProps.nodePadding !== nodePadding || nextProps.nameKey !== nameKey) {
        this.setState(this.createDefaultState(this.props));
      }
    }
    /**
     * Returns default, reset state for the sankey chart.
     * @param  {Object} props The latest props
     * @return {Object} Whole new state
     */

  }, {
    key: 'createDefaultState',
    value: function createDefaultState(props) {
      var data = props.data,
          width = props.width,
          height = props.height,
          margin = props.margin,
          iterations = props.iterations,
          nodeWidth = props.nodeWidth,
          nodePadding = props.nodePadding;

      var contentWidth = width - (margin && margin.left || 0) - (margin && margin.right || 0);
      var contentHeight = height - (margin && margin.top || 0) - (margin && margin.bottom || 0);

      var _computeData = computeData({
        data: data,
        width: contentWidth,
        height: contentHeight,
        iterations: iterations, nodeWidth: nodeWidth, nodePadding: nodePadding
      }),
          links = _computeData.links,
          nodes = _computeData.nodes;

      return {
        activeElement: null,
        activeElementType: null,
        isTooltipActive: false,
        nodes: nodes, links: links
      };
    }
  }, {
    key: 'handleMouseEnter',
    value: function handleMouseEnter(el, type, e) {
      var _props2 = this.props,
          onMouseEnter = _props2.onMouseEnter,
          children = _props2.children;

      var tooltipItem = findChildByType(children, Tooltip);

      if (tooltipItem) {
        this.setState({
          activeElement: el,
          activeElementType: type,
          isTooltipActive: true
        }, function () {
          if (onMouseEnter) {
            onMouseEnter(el, type, e);
          }
        });
      } else if (onMouseEnter) {
        onMouseEnter(el, type, e);
      }
    }
  }, {
    key: 'handleMouseLeave',
    value: function handleMouseLeave(el, type, e) {
      var _props3 = this.props,
          onMouseLeave = _props3.onMouseLeave,
          children = _props3.children;

      var tooltipItem = findChildByType(children, Tooltip);

      if (tooltipItem) {
        this.setState({
          isTooltipActive: false
        }, function () {
          if (onMouseLeave) {
            onMouseLeave(el, type, e);
          }
        });
      } else if (onMouseLeave) {
        onMouseLeave(el, type, e);
      }
    }
  }, {
    key: 'renderLinkItem',
    value: function renderLinkItem(option, props) {
      if (React.isValidElement(option)) {
        return React.cloneElement(option, props);
      } else if (_isFunction(option)) {
        return option(props);
      }

      var sourceX = props.sourceX,
          sourceY = props.sourceY,
          sourceControlX = props.sourceControlX,
          targetX = props.targetX,
          targetY = props.targetY,
          targetControlX = props.targetControlX,
          linkWidth = props.linkWidth,
          others = _objectWithoutProperties(props, ['sourceX', 'sourceY', 'sourceControlX', 'targetX', 'targetY', 'targetControlX', 'linkWidth']);

      return React.createElement('path', _extends({
        className: 'recharts-sankey-link',
        d: '\n          M' + sourceX + ',' + sourceY + '\n          C' + sourceControlX + ',' + sourceY + ' ' + targetControlX + ',' + targetY + ' ' + targetX + ',' + targetY + '\n        ',
        fill: 'none',
        stroke: '#333',
        strokeWidth: linkWidth,
        strokeOpacity: '0.2'
      }, getPresentationAttributes(others)));
    }
  }, {
    key: 'renderLinks',
    value: function renderLinks(links, nodes) {
      var _this2 = this;

      var _props4 = this.props,
          linkCurvature = _props4.linkCurvature,
          linkContent = _props4.link,
          margin = _props4.margin;

      var top = margin.top || 0;
      var left = margin.left || 0;

      return React.createElement(
        Layer,
        { className: 'recharts-sankey-links', key: 'recharts-sankey-links' },
        links.map(function (link, i) {
          var sourceRelativeY = link.sy,
              targetRelativeY = link.ty,
              linkWidth = link.dy;

          var source = nodes[link.source];
          var target = nodes[link.target];
          var sourceX = source.x + source.dx + left;
          var targetX = target.x + left;
          var interpolationFunc = interpolationGenerator(sourceX, targetX);
          var sourceControlX = interpolationFunc(linkCurvature);
          var targetControlX = interpolationFunc(1 - linkCurvature);
          var sourceY = source.y + sourceRelativeY + linkWidth / 2 + top;
          var targetY = target.y + targetRelativeY + linkWidth / 2 + top;

          var linkProps = _extends({
            sourceX: sourceX, targetX: targetX,
            sourceY: sourceY, targetY: targetY,
            sourceControlX: sourceControlX, targetControlX: targetControlX,
            sourceRelativeY: sourceRelativeY, targetRelativeY: targetRelativeY,
            linkWidth: linkWidth,
            index: i,
            payload: _extends({}, link, { source: source, target: target })
          }, getPresentationAttributes(linkContent));
          var events = {
            onMouseEnter: _this2.handleMouseEnter.bind(_this2, linkProps, 'link'),
            onMouseLeave: _this2.handleMouseLeave.bind(_this2, linkProps, 'link')
          };

          return React.createElement(
            Layer,
            _extends({ key: 'link' + i }, events),
            _this2.renderLinkItem(linkContent, linkProps)
          );
        })
      );
    }
  }, {
    key: 'renderNodeItem',
    value: function renderNodeItem(option, props) {
      if (React.isValidElement(option)) {
        return React.cloneElement(option, props);
      } else if (_isFunction(option)) {
        return option(props);
      }

      return React.createElement(Rectangle, _extends({
        className: 'recharts-sankey-node',
        fill: '#0088fe',
        fillOpacity: '0.8'
      }, props));
    }
  }, {
    key: 'renderNodes',
    value: function renderNodes(nodes) {
      var _this3 = this;

      var _props5 = this.props,
          nodeContent = _props5.node,
          margin = _props5.margin;

      var top = margin.top || 0;
      var left = margin.left || 0;

      return React.createElement(
        Layer,
        { className: 'recharts-sankey-nodes', key: 'recharts-sankey-nodes' },
        nodes.map(function (node, i) {
          var x = node.x,
              y = node.y,
              dx = node.dx,
              dy = node.dy;

          var nodeProps = _extends({}, getPresentationAttributes(nodeContent), {
            x: x + left,
            y: y + top,
            width: dx,
            height: dy,
            index: i,
            payload: node
          });
          var events = {
            onMouseEnter: _this3.handleMouseEnter.bind(_this3, nodeProps, 'node'),
            onMouseLeave: _this3.handleMouseLeave.bind(_this3, nodeProps, 'node')
          };

          return React.createElement(
            Layer,
            _extends({ key: 'node' + i }, events),
            _this3.renderNodeItem(nodeContent, nodeProps)
          );
        })
      );
    }
  }, {
    key: 'renderTooltip',
    value: function renderTooltip() {
      var _props6 = this.props,
          children = _props6.children,
          width = _props6.width,
          height = _props6.height,
          nameKey = _props6.nameKey;

      var tooltipItem = findChildByType(children, Tooltip);

      if (!tooltipItem) {
        return null;
      }

      var _state = this.state,
          isTooltipActive = _state.isTooltipActive,
          activeElement = _state.activeElement,
          activeElementType = _state.activeElementType;

      var viewBox = { x: 0, y: 0, width: width, height: height };
      var coordinate = activeElement ? getCoordinateOfTooltip(activeElement, activeElementType) : defaultCoordinateOfTooltip;
      var payload = activeElement ? getPayloadOfTooltip(activeElement, activeElementType, nameKey) : [];

      return React.cloneElement(tooltipItem, {
        viewBox: viewBox,
        active: isTooltipActive,
        coordinate: coordinate,
        label: '',
        payload: payload
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!validateWidthHeight(this)) {
        return null;
      }

      var _props7 = this.props,
          data = _props7.data,
          width = _props7.width,
          height = _props7.height,
          className = _props7.className,
          style = _props7.style,
          children = _props7.children,
          others = _objectWithoutProperties(_props7, ['data', 'width', 'height', 'className', 'style', 'children']);

      var _state2 = this.state,
          links = _state2.links,
          nodes = _state2.nodes;

      var attrs = getPresentationAttributes(others);

      return React.createElement(
        'div',
        {
          className: classNames('recharts-wrapper', className),
          style: _extends({}, style, { position: 'relative', cursor: 'default', width: width, height: height })
        },
        React.createElement(
          Surface,
          _extends({}, attrs, { width: width, height: height }),
          filterSvgElements(children),
          this.renderLinks(links, nodes),
          this.renderNodes(nodes)
        ),
        this.renderTooltip()
      );
    }
  }]);

  return Sankey;
}(Component), _class2.displayName = 'Sankey', _class2.propTypes = _extends({}, PRESENTATION_ATTRIBUTES, EVENT_ATTRIBUTES, {

  nameKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]),
  dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]),
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.shape({
    nodes: PropTypes.array,
    links: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.number,
      source: PropTypes.number,
      value: PropTypes.number
    }))
  }),

  nodePadding: PropTypes.number,
  nodeWidth: PropTypes.number,
  linkCurvature: PropTypes.number,
  iterations: PropTypes.number,

  node: PropTypes.oneOfType([PropTypes.object, PropTypes.element, PropTypes.func]),
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.element, PropTypes.func]),

  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number
  })
}), _class2.defaultProps = {
  nodePadding: 10,
  nodeWidth: 10,
  nameKey: 'name',
  dataKey: 'value',
  linkCurvature: 0.5,
  iterations: 32,
  margin: { top: 5, right: 5, bottom: 5, left: 5 }
}, _temp)) || _class;

export default Sankey;
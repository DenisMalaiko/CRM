const React = require('react')

const ResponsiveContainer = ({ children }) =>
  React.createElement('div', { 'data-testid': 'responsive-container' }, children)

const AreaChart = ({ children }) => React.createElement('svg', null, children)

const Area = () => null
const XAxis = () => null
const YAxis = () => null
const Tooltip = () => null

module.exports = {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
}

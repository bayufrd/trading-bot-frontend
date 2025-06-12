import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, TrendingUp, Settings, Activity, Database } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

const TradingBotApp = () => {
  const [config, setConfig] = useState({
    symbol: 'BTCUSDT',
    timeframe: '5m',
    plusDIThreshold: 25,
    minusDIThreshold: 20,
    adxMinimum: 20,
    takeProfitPercent: 2,
    stopLossPercent: 1,
    leverage: '10x'
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('config');

  // Load initial config
  useEffect(() => {
    console.log('Loading Config...');
    loadConfig();
    loadOrders();
  }, []);

  // Log when state updates
  console.log('Current Config:', config);
  console.log('Orders:', orders);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/config`);
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        console.log('Error loading configuration:', data);
        setMessage('Error loading configuration');
      }
    } catch (error) {
      console.log('Error loading configuration:', error);
      setMessage('Error loading configuration');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        console.log('Error loading orders:', data);
        setMessage('Error loading orders');
      }
    } catch (error) {
      console.log('Error loading orders:', error);
      setMessage('Error loading orders');
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Configuration saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving configuration');
      }
    } catch (error) {
      setMessage('Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const resetConfig = async () => {
    const defaultConfig = {
      symbol: 'BTCUSDT',
      timeframe: '5m',
      plusDIThreshold: 25,
      minusDIThreshold: 20,
      adxMinimum: 20,
      takeProfitPercent: 2,
      stopLossPercent: 1,
      leverage: '10x'
    };

    setConfig(defaultConfig); // Update the local state

    // Save the default config to the backend as well
    try {
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultConfig),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Configuration reset to defaults');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error resetting configuration');
      }
    } catch (error) {
      setMessage('Error resetting configuration');
    }
  };


  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testBinanceAPI = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test-binance/${config?.symbol}`);
      const data = await response.json();
  
      if (data.success) {
        setMessage(`Binance API OK! Current ${config?.symbol} price: ${data.price}`);
      } else {
        setMessage(`Binance API Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`Error testing Binance API connection: ${error.message}`);
    }
};

    

  const testWebhook = async () => {
    const testSignal = {
      symbol: config?.symbol,
      plusDI: 27.5,
      minusDI: 15.0,
      adx: 25.0,
      timeframe: config?.timeframe
    };

    try {
      const response = await fetch(`${API_BASE_URL}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testSignal),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Test signal sent successfully!');
        loadOrders();
      } else {
        setMessage('Test signal failed');
      }
    } catch (error) {
      setMessage('Error sending test signal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Trading Bot Dashboard
          </h1>
          <p className="text-slate-300">DMI/ADX Strategy Configuration & Monitoring</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-center">
            {message}
          </div>
        )}

        {/* <div className="text-center py-8 text-white">
          <p>Page is rendering properly!</p>
        </div> */}

        {/* Tabs */}
        <div className="flex mb-6 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${activeTab === 'config'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
          >
            <Settings size={20} />
            <span>Configuration</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${activeTab === 'orders'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
          >
            <Database size={20} />
            <span>Orders ({orders.length})</span>
          </button>
        </div>

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">Basic Settings</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Symbol</label>
                  <input
                    type="text"
                    value={config?.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Timeframe</label>
                  <select
                    value={config?.timeframe}
                    onChange={(e) => handleInputChange('timeframe', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1d">1d</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Leverage</label>
                  <select
                    value={config?.leverage}
                    onChange={(e) => handleInputChange('leverage', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1x">1x</option>
                    <option value="5x">5x</option>
                    <option value="10x">10x</option>
                    <option value="20x">20x</option>
                    <option value="50x">50x</option>
                  </select>
                </div>
              </div>

              {/* Strategy Settings */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-300 mb-4">Strategy Settings</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">+DI Threshold</label>
                  <input
                    type="number"
                    value={config?.plusDIThreshold}
                    onChange={(e) => handleInputChange('plusDIThreshold', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">-DI Threshold</label>
                  <input
                    type="number"
                    value={config?.minusDIThreshold}
                    onChange={(e) => handleInputChange('minusDIThreshold', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ADX Minimum</label>
                  <input
                    type="number"
                    value={config?.adxMinimum}
                    onChange={(e) => handleInputChange('adxMinimum', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Risk Management */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-300 mb-4">Risk Management</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Take Profit (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config?.takeProfitPercent}
                    onChange={(e) => handleInputChange('takeProfitPercent', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Stop Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={config?.stopLossPercent}
                    onChange={(e) => handleInputChange('stopLossPercent', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Current Configuration Display */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">Active Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Symbol:</span>
                    <span className="text-white font-medium">{config?.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Timeframe:</span>
                    <span className="text-white font-medium">{config?.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">+DI Threshold:</span>
                    <span className="text-white font-medium">{config?.plusDIThreshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">-DI Threshold:</span>
                    <span className="text-white font-medium">{config?.minusDIThreshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">ADX Minimum:</span>
                    <span className="text-white font-medium">{config?.adxMinimum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Take Profit:</span>
                    <span className="text-green-400 font-medium">{config?.takeProfitPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Stop Loss:</span>
                    <span className="text-red-400 font-medium">{config?.stopLossPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Leverage:</span>
                    <span className="text-white font-medium">{config.leverage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={saveConfig}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
              </button>

              <button
                onClick={resetConfig}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw size={20} />
                <span>Reset to Defaults</span>
              </button>

              <button
                onClick={testBinanceAPI}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <TrendingUp size={20} />
                <span>Test Binance API</span>
              </button>

              <button
                onClick={testWebhook}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Activity size={20} />
                <span>Test Signal</span>
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-blue-300">Order History</h3>
              <button
                onClick={loadOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p>No orders yet. Test the webhook to see orders here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-300">Time</th>
                      <th className="text-left py-3 px-4 text-slate-300">Symbol</th>
                      <th className="text-left py-3 px-4 text-slate-300">Action</th>
                      <th className="text-left py-3 px-4 text-slate-300">Entry</th>
                      <th className="text-left py-3 px-4 text-slate-300">TP</th>
                      <th className="text-left py-3 px-4 text-slate-300">SL</th>
                      <th className="text-left py-3 px-4 text-slate-300">Leverage</th>
                      <th className="text-left py-3 px-4 text-slate-300">Signals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4 text-slate-300">
                          {new Date(order.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{order.symbol}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${order.action === 'BUY'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                            }`}>
                            {order.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-mono">${order.price_entry}</td>
                        <td className="py-3 px-4 text-green-400 font-mono">${order.tp_price}</td>
                        <td className="py-3 px-4 text-red-400 font-mono">${order.sl_price}</td>
                        <td className="py-3 px-4 text-purple-400">{order.leverage}</td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          +DI: {order.signal_data?.plusDI}<br />
                          -DI: {order.signal_data?.minusDI}<br />
                          ADX: {order.signal_data?.adx}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default TradingBotApp;
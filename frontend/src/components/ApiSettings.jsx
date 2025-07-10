import React, { useState, useEffect } from 'react';
import { getAvailableModels } from '../services/huggingFaceService';
import './ApiSettings.css';

const ApiSettings = ({ isOpen, onClose, onSave }) => {
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem('hf_model') || 'OpenAssistant/oasst-sft-1-pythia-12b');
  const [models, setModels] = useState([
    { id: 'OpenAssistant/oasst-sft-1-pythia-12b', name: 'OpenAssistant Pythia-12B' },
    { id: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5', name: 'OpenAssistant Pythia-12B (3.5)' },
    { id: 'facebook/opt-350m', name: 'OPT-350M (更快)' }
  ]);
  
  // 加载可用模型
  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await getAvailableModels();
        if (availableModels && availableModels.length > 0) {
          setModels(availableModels);
        }
      } catch (error) {
        console.error('加载模型列表失败:', error);
      }
    };
    
    loadModels();
  }, []);
  
  // 保存设置
  const handleSave = () => {
    // 保存选定的模型
    localStorage.setItem('hf_model', selectedModel);
    
    // 调用保存回调
    if (onSave) {
      onSave({ selectedModel });
    }
    
    // 关闭设置
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="api-settings-overlay">
      <div className="api-settings-modal">
        <h2>API 设置</h2>
        
        <div className="settings-section">
          <h3>安全API连接</h3>
          
          <div className="info-box">
            <p>API请求已通过安全的后端代理处理，无需输入API密钥。</p>
            <p>所有请求都通过Cloudflare Worker进行，保护您的隐私和安全。</p>
            <p>API密钥安全地存储在服务器端，从不暴露给客户端。</p>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>模型选择</h3>
          
          <div className="form-group">
            <label htmlFor="model-select">选择模型:</label>
            <select
              id="model-select"
              name="model-select"
              autocomplete="off"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name || model.id}
                </option>
              ))}
            </select>
            <div className="model-info">
              <p>选择不同的模型可能会影响响应质量和速度。</p>
              <p>• OpenAssistant Pythia-12B: 高质量回复，但较慢</p>
              <p>• OPT-350M: 回复质量较低，但速度更快</p>
            </div>
          </div>
        </div>
        
        <div className="button-group">
          <button type="button" onClick={handleSave} className="save-button">
            保存
          </button>
          <button type="button" onClick={onClose} className="cancel-button">
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings; 
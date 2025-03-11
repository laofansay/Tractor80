'use client';

import React, { useState, useEffect } from 'react';

type ToastProps = {
    message: string;
    type?: 'error' | 'warning' | 'success' | 'info';
    duration?: number;
    onClose?: () => void;
    isVisible: boolean;
};

export function Toast({ message, type = 'error', duration = 3000, onClose, isVisible }: ToastProps) {
    const [visible, setVisible] = useState(isVisible);

    useEffect(() => {
        setVisible(isVisible);

        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    // 如果不可见，不渲染任何内容
    if (!visible) return null;

    // 根据类型确定样式
    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return 'bg-red-500 border-red-600';
            case 'warning':
                return 'bg-yellow-500 border-yellow-600';
            case 'success':
                return 'bg-green-500 border-green-600';
            case 'info':
                return 'bg-blue-500 border-blue-600';
            default:
                return 'bg-gray-700 border-gray-800';
        }
    };

    // 根据类型确定图标
    const getTypeIcon = () => {
        switch (type) {
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
            <div className={`flex items-center p-4 mb-4 rounded-lg shadow-lg border ${getTypeStyles()} text-white`}>
                <div className="inline-flex items-center justify-center flex-shrink-0 mr-2">
                    {getTypeIcon()}
                </div>
                <div className="text-sm font-medium">{message}</div>
                <button
                    type="button"
                    className="ml-auto -mx-1.5 -my-1.5 text-white rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none"
                    onClick={() => {
                        setVisible(false);
                        if (onClose) onClose();
                    }}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// 添加一个全局的Toast管理器
export function ToastContainer() {
    const [toasts, setToasts] = useState < { id: string, message: string, type: 'error' | 'warning' | 'success' | 'info', duration: number }[] > ([]);

    // 添加一个新的Toast
    const addToast = (message: string, type: 'error' | 'warning' | 'success' | 'info' = 'error', duration: number = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts([...toasts, { id, message, type, duration }]);

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    // 移除一个Toast
    const removeToast = (id: string) => {
        setToasts(toasts.filter(toast => toast.id !== id));
    };

    return {
        toasts,
        addToast,
        removeToast,
        render: () => (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                        isVisible={true}
                    />
                ))}
            </div>
        )
    };
}

// 创建一个全局的Toast实例
export const toast = {
    // 错误提示
    error: (message: string, duration: number = 3000) => {
        // 在客户端环境中创建一个临时的div来显示Toast
        if (typeof document !== 'undefined') {
            const toastId = `toast-${Math.random().toString(36).substring(2, 9)}`;
            let toastContainer = document.getElementById('toast-container');

            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                document.body.appendChild(toastContainer);
            }

            const toastElement = document.createElement('div');
            toastElement.id = toastId;
            toastContainer.appendChild(toastElement);

            // 添加样式
            toastElement.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down';
            toastElement.innerHTML = `
        <div class="flex items-center p-4 mb-4 rounded-lg shadow-lg border bg-red-500 border-red-600 text-white">
          <div class="inline-flex items-center justify-center flex-shrink-0 mr-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-sm font-medium">${message}</div>
          <button 
            type="button" 
            class="ml-auto -mx-1.5 -my-1.5 text-white rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none"
            onclick="document.getElementById('${toastId}').remove()"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `;

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    },

    // 成功提示
    success: (message: string, duration: number = 3000) => {
        if (typeof document !== 'undefined') {
            const toastId = `toast-${Math.random().toString(36).substring(2, 9)}`;
            let toastContainer = document.getElementById('toast-container');

            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                document.body.appendChild(toastContainer);
            }

            const toastElement = document.createElement('div');
            toastElement.id = toastId;
            toastContainer.appendChild(toastElement);

            toastElement.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down';
            toastElement.innerHTML = `
        <div class="flex items-center p-4 mb-4 rounded-lg shadow-lg border bg-green-500 border-green-600 text-white">
          <div class="inline-flex items-center justify-center flex-shrink-0 mr-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-sm font-medium">${message}</div>
          <button 
            type="button" 
            class="ml-auto -mx-1.5 -my-1.5 text-white rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none"
            onclick="document.getElementById('${toastId}').remove()"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `;

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    },

    // 信息提示
    info: (message: string, duration: number = 3000) => {
        if (typeof document !== 'undefined') {
            const toastId = `toast-${Math.random().toString(36).substring(2, 9)}`;
            let toastContainer = document.getElementById('toast-container');

            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                document.body.appendChild(toastContainer);
            }

            const toastElement = document.createElement('div');
            toastElement.id = toastId;
            toastContainer.appendChild(toastElement);

            toastElement.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down';
            toastElement.innerHTML = `
        <div class="flex items-center p-4 mb-4 rounded-lg shadow-lg border bg-blue-500 border-blue-600 text-white">
          <div class="inline-flex items-center justify-center flex-shrink-0 mr-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-sm font-medium">${message}</div>
          <button 
            type="button" 
            class="ml-auto -mx-1.5 -my-1.5 text-white rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none"
            onclick="document.getElementById('${toastId}').remove()"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `;

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    },

    // 警告提示

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    },

    warning: (message: string, duration: number = 3000) => {
        if (typeof document !== 'undefined') {
            const toastId = `toast-${Math.random().toString(36).substring(2, 9)}`;
            let toastContainer = document.getElementById('toast-container');

            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                document.body.appendChild(toastContainer);
            }

            const toastElement = document.createElement('div');
            toastElement.id = toastId;
            toastContainer.appendChild(toastElement);

            toastElement.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down';
            toastElement.innerHTML = `
        <div class="flex items-center p-4 mb-4 rounded-lg shadow-lg border bg-yellow-500 border-yellow-600 text-white">
          <div class="inline-flex items-center justify-center flex-shrink-0 mr-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-sm font-medium">${message}</div>
          <button 
            type="button" 
            class="ml-auto -mx-1.5 -my-1.5 text-white rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none"
            onclick="document.getElementById('${toastId}').remove()"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      `;

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    },

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    }

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    },

    // 信息提示
    info: (message: string, duration: number = 3000) => {
        if (typeof document !== 'undefined') {
            const toastId = `toast - ${ Math.random().toString(36).substring(2, 9) } `;
            let toastContainer = document.getElementById('toast-container');

            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                document.body.appendChild(toastContainer);
            }

            const toastElement = document.createElement('div');
            toastElement.id = toastId;
            toastContainer.appendChild(toastElement);

            toastElement.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down';
            toastElement.innerHTML = `
    < div class="flex items-center p-4 mb-4 rounded-lg shadow-lg border bg-blue-500 border-blue-600 text-white" >
          <div class="inline-flex items-center justify-center flex-shrink-0 mr-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-sm font-medium">${message}</div>
          <button 
            type="button" 
            class="ml-auto -mx-1.5 -my-1.5 text-white rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none"
            onclick="document.getElementById('${toastId}').remove()"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div >
    `;

            // 自动移除
            if (duration > 0) {
                setTimeout(() => {
                    if (document.getElementById(toastId)) {
                        document.getElementById(toastId)?.remove();
                    }
                }, duration);
            }
        }
    }
import React, { useState, useEffect } from 'react';
import { subscribeToAuditLogs } from '../../services/auditService';
import { AuditLog } from '../../types';
import { format } from 'date-fns';
import { FileText, Eye, Plus, CreditCard as Edit, Trash2 } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs((data) => {
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 mobile-container safe-area-bottom">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-gray-700 mr-3" />
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Audit Logs</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No audit logs found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div key={log.id} className="p-3 sm:p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(log.action)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {log.entityType}
                        </span>
                        <span className="text-sm text-gray-500">
                          by {log.performedBy}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(log.performedAt, 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => log.id && toggleExpanded(log.id)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 mobile-touch-target p-2"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {expandedLog === log.id ? 'Hide' : 'View'} Details
                  </button>
                </div>

                {expandedLog === log.id && (
                  <div className="mt-4 pl-0 sm:pl-7">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.beforeValues && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                              Before Values
                            </h4>
                            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.beforeValues, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {log.afterValues && (
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                              After Values
                            </h4>
                            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.afterValues, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500">
                        <p><strong>Entity ID:</strong> {log.entityId}</p>
                        <p><strong>Timestamp:</strong> {format(log.performedAt, 'PPpp')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
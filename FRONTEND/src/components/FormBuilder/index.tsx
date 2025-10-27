import React, { useState } from 'react';
import { ComponentSidebar } from './ComponentSidebar';
import { FormCanvas } from './FormCanvas';
import { FormPreview } from './FormPreview';
import { PropertiesPanel } from './PropertiesPanel';
import { Eye, Edit3, Download, Settings, ArrowLeft, Save } from 'lucide-react';
import type { FormField } from '../../types/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../atoms/Button';
import { useNavigate } from 'react-router-dom';

export const FormBuilder = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const navigate = useNavigate(); 
  const selectedField = fields.find(field => field.id === selectedFieldId) || null;

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const handleFieldSelect = (fieldId: string | null) => {
    setSelectedFieldId(fieldId);
    // Show properties panel when a field is selected, hide when no field is selected
    setShowPropertiesPanel(fieldId !== null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicking on the canvas background (not on a field), deselect the field
    if (e.target === e.currentTarget) {
      setSelectedFieldId(null);
      setShowPropertiesPanel(false);
    }
  };

  const exportForm = () => {
    const formData = {
      title: 'My Custom Form',
      description: 'Form created with FormBuilder',
      fields: fields
    };
    
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between w-full border-b border-[#F2F2F2] pb-4 bg-white p-3">
      
        <div className="flex items-center gap-4">
          <Button
                variant="default"
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap py-1"
                onClick={() => navigate('/form-list')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
                
            </Button>
          
          <h2 className="text-md font-semibold text-gray-900">Form builder</h2>
          </div>
          <div className=" flex gap-4 text-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                <TabsTrigger value="builder" className={`tabs-trigger ${activeTab === 'builder' ? 'active' : ''}`}>
                    <span className="flex items-center gap-2 ">
                      <Edit3 className="h-4 w-4" />
                      Builder
                    </span>
                   
                  </TabsTrigger>
                  <TabsTrigger value="preview" className={`tabs-trigger ${activeTab === 'preview' ? 'active' : ''}`}>
                    <span className="flex items-center gap-2 ">
                      <Eye className="h-4 w-4" />
                      Preview
                    </span>
                    
                  </TabsTrigger>
                </TabsList>
              </Tabs>
          
          </div>
        
        <div className="flex gap-2">
        {fields.length > 0 && (
          <Button variant="default" size="sm" className="hidden items-center gap-1 whitespace-nowrap h-6">  <Download className="h-4 w-4" />
                  Export 
            </Button>
        )}
          <Button variant="default" size="sm" onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}  title={showPropertiesPanel ? "Hide Properties Panel" : "Show Properties Panel"}className="flex items-center gap-1 whitespace-nowrap py-1"> <Settings className="h-4 w-4" />
          {showPropertiesPanel ? "Hide Properties" : "Show Properties"}</Button>

          <Button variant="default" size="sm" className="flex items-center gap-1 whitespace-nowrap  py-1"> <Save className="h-4 w-4" />
          Save</Button>
        </div>
    </div>
  
    <div className="bg-white shadow-sm rounded-lg p-4">
     
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="builder" className="m-0">
        
          <div className="flex">
            <ComponentSidebar />
            <div className="flex-1" onClick={handleCanvasClick}>
              <FormCanvas 
                fields={fields} 
                onFieldsChange={setFields}
                selectedFieldId={selectedFieldId}
                onFieldSelect={handleFieldSelect}
              />
            </div>
            <div className={`transition-all duration-300 ease-in-out fixed top-0 right-0 h-full p-10 bg-white shadow-xl ${showPropertiesPanel ? 'w-96 opacity-100 z-50' : 'w-0 opacity-0 overflow-hidden z-0'}`}>
              {showPropertiesPanel && (
                <PropertiesPanel 
                    selectedField={selectedField}
                    onFieldUpdate={updateField} 
                    setShowPropertiesPanel={setShowPropertiesPanel}  />
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="m-0">
          <div className="p-6 bg-gray-50 bg-no-repeat border-0" style={{ backgroundImage: "url('/assets/images/form-builderbg.png')" }}>
            <FormPreview fields={fields} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
};
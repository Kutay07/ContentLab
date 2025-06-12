"use client";

import React, { useState, useEffect } from "react";
import { Json } from "@/types/supabase";

interface ComponentEditFormTabProps {
  content: Json;
  onContentChange: (newContent: Json) => void;
}

interface FormField {
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "object" | "array";
  path: string[];
}

const ComponentEditFormTab: React.FC<ComponentEditFormTabProps> = ({
  content,
  onContentChange,
}) => {
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // JSON'u form alanlarına dönüştür
  useEffect(() => {
    const flattenObject = (obj: any, path: string[] = []): FormField[] => {
      const fields: FormField[] = [];

      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = [...path, key];

          if (value === null || value === undefined) {
            fields.push({
              key,
              value: "",
              type: "string",
              path: currentPath,
            });
          } else if (typeof value === "string") {
            fields.push({
              key,
              value,
              type: "string",
              path: currentPath,
            });
          } else if (typeof value === "number") {
            fields.push({
              key,
              value,
              type: "number",
              path: currentPath,
            });
          } else if (typeof value === "boolean") {
            fields.push({
              key,
              value,
              type: "boolean",
              path: currentPath,
            });
          } else if (Array.isArray(value)) {
            fields.push({
              key,
              value: JSON.stringify(value, null, 2),
              type: "array",
              path: currentPath,
            });
          } else if (typeof value === "object") {
            fields.push({
              key,
              value: JSON.stringify(value, null, 2),
              type: "object",
              path: currentPath,
            });
          }
        });
      }

      return fields;
    };

    setFormFields(flattenObject(content));
  }, [content]);

  const updateFieldValue = (fieldPath: string[], newValue: any) => {
    const newContent = JSON.parse(JSON.stringify(content)) || {};

    let current = newContent;
    for (let i = 0; i < fieldPath.length - 1; i++) {
      if (!current[fieldPath[i]]) {
        current[fieldPath[i]] = {};
      }
      current = current[fieldPath[i]];
    }

    const lastKey = fieldPath[fieldPath.length - 1];
    current[lastKey] = newValue;

    onContentChange(newContent);
  };

  const addNewField = () => {
    const fieldName = prompt("Yeni alan adını girin:");
    if (fieldName && fieldName.trim()) {
      updateFieldValue([fieldName.trim()], "");
    }
  };

  const removeField = (fieldPath: string[]) => {
    const newContent = JSON.parse(JSON.stringify(content)) || {};

    let current = newContent;
    for (let i = 0; i < fieldPath.length - 1; i++) {
      current = current[fieldPath[i]];
    }

    const lastKey = fieldPath[fieldPath.length - 1];
    delete current[lastKey];

    onContentChange(newContent);
  };

  const renderField = (field: FormField) => {
    const handleChange = (newValue: any) => {
      updateFieldValue(field.path, newValue);
    };

    switch (field.type) {
      case "string":
        return (
          <div key={field.path.join(".")} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.key}
              </label>
              <button
                onClick={() => removeField(field.path)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Sil
              </button>
            </div>
            {field.value && field.value.length > 50 ? (
              <textarea
                value={field.value}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={field.value}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        );

      case "number":
        return (
          <div key={field.path.join(".")} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.key} (sayı)
              </label>
              <button
                onClick={() => removeField(field.path)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Sil
              </button>
            </div>
            <input
              type="number"
              value={field.value}
              onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case "boolean":
        return (
          <div key={field.path.join(".")} className="mb-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => handleChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {field.key}
                </span>
              </label>
              <button
                onClick={() => removeField(field.path)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Sil
              </button>
            </div>
          </div>
        );

      case "array":
      case "object":
        return (
          <div key={field.path.join(".")} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.key} ({field.type === "array" ? "dizi" : "nesne"})
              </label>
              <button
                onClick={() => removeField(field.path)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                Sil
              </button>
            </div>
            <textarea
              value={field.value}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleChange(parsed);
                } catch (err) {
                  // Geçersiz JSON, değeri güncelleme
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="JSON formatında girin..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Form Editor</h3>
        <button
          onClick={addNewField}
          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
        >
          + Alan Ekle
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {formFields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Henüz form alanı bulunmuyor.</p>
            <button
              onClick={addNewField}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              İlk alanı ekleyin
            </button>
          </div>
        ) : (
          <div className="space-y-1">{formFields.map(renderField)}</div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>İpucu:</strong> Form alanları JSON içeriğinizden otomatik
          olarak oluşturulur. Değişiklikler anında JSON'a yansır.
        </p>
      </div>
    </div>
  );
};

export default ComponentEditFormTab;

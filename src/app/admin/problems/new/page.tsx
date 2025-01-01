"use client"

import React, { useState, useRef } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { X, Upload, FileUp, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProblemFormValues {
  title: string;
  slug: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  difficulty: number;
  tags: string[];
}

interface FileInputProps {
  label: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  file: File | null;
}

const FileInput: React.FC<FileInputProps> = ({ label, accept, onChange, onRemove, file }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="block font-medium">{label}</label>
      <div className="relative">
        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors duration-200 bg-gray-50/50"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">.zip files only</p>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default function CreateProblemPage() {
  const router = useRouter();
  const createProblem = api.problem.create.useMutation({
    onSuccess: (problem) => {
      toast.success("Problem created successfully!");
      router.push(`/problems/${problem.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
      if (error.message.includes("administrators")) {
        router.push("/problems");
      }
    },
  });

  const [formValues, setFormValues] = useState<ProblemFormValues>({
    title: '',
    slug: '',
    statement: '',
    inputDescription: '',
    outputDescription: '',
    difficulty: 5,
    tags: [],
  });

  const [newTag, setNewTag] = useState('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProblemFormValues, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProblemFormValues, string>> = {};

    if (!formValues.title) newErrors.title = 'Title is required';
    if (formValues.title.length > 100) newErrors.title = 'Title must be 100 characters or less';
    if (!formValues.slug) newErrors.slug = 'Slug is required';
    if (!formValues.statement) newErrors.statement = 'Problem statement is required';
    if (!formValues.inputDescription) newErrors.inputDescription = 'Input description is required';
    if (!formValues.outputDescription) newErrors.outputDescription = 'Output description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputFile || !outputFile) {
      toast.error('Please upload both input and output test cases');
      return;
    }

    if (validateForm()) {
      try {
        await createProblem.mutateAsync(formValues);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof ProblemFormValues
  ) => {
    setFormValues(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleDifficultyChange = (value: number) => {
    setFormValues(prev => ({
      ...prev,
      difficulty: value
    }));
  };

  const addTag = () => {
    if (newTag && !formValues.tags.includes(newTag)) {
      setFormValues(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormValues(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/zip') {
      setInputFile(file);
    } else {
      toast.error('Please upload a zip file');
    }
  };

  const handleOutputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/zip') {
      setOutputFile(file);
    } else {
      toast.error('Please upload a zip file');
    }
  };

  return (
    <div className="w-full mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-8">Create new problem</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-medium">Title</label>
            <Input
              value={formValues.title}
              onChange={(e) => handleInputChange(e, 'title')}
              placeholder="Enter problem title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Slug</label>
            <Input
              value={formValues.slug}
              onChange={(e) => handleInputChange(e, 'slug')}
              placeholder="enter-problem-slug"
              className={errors.slug ? 'border-red-500' : ''}
            />
            {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Problem Statement</label>
            <textarea
              value={formValues.statement}
              onChange={(e) => handleInputChange(e, 'statement')}
              placeholder="Describe the problem..."
              className={`w-full min-h-[200px] p-2 border rounded-md ${errors.statement ? 'border-red-500' : ''}`}
            />
            {errors.statement && <p className="text-red-500 text-sm">{errors.statement}</p>}
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Input Description</label>
            <textarea
              value={formValues.inputDescription}
              onChange={(e) => handleInputChange(e, 'inputDescription')}
              placeholder="Describe the input format..."
              className={`w-full min-h-[100px] p-2 border rounded-md ${errors.inputDescription ? 'border-red-500' : ''}`}
            />
            {errors.inputDescription && <p className="text-red-500 text-sm">{errors.inputDescription}</p>}
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Output Description</label>
            <textarea
              value={formValues.outputDescription}
              onChange={(e) => handleInputChange(e, 'outputDescription')}
              placeholder="Describe the output format..."
              className={`w-full min-h-[100px] p-2 border rounded-md ${errors.outputDescription ? 'border-red-500' : ''}`}
            />
            {errors.outputDescription && <p className="text-red-500 text-sm">{errors.outputDescription}</p>}
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Difficulty (1-10)</label>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={formValues.difficulty}
              onChange={(e) => handleDifficultyChange(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600">Current difficulty: {formValues.difficulty}</p>
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Tags</label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={!newTag || formValues.tags.includes(newTag)}
              >
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formValues.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FileInput
              label="Input test cases"
              accept=".zip"
              onChange={handleInputFileChange}
              onRemove={() => setInputFile(null)}
              file={inputFile}
            />
            
            <FileInput
              label="Output test cases"
              accept=".zip"
              onChange={handleOutputFileChange}
              onRemove={() => setOutputFile(null)}
              file={outputFile}
            />
          </div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
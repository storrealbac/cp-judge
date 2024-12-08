"use client"

import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { X } from 'lucide-react';
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

export default function CreateProblemPage() {
  const router = useRouter();
  const createProblem = api.problem.create.useMutation({
    onSuccess: (problem) => {
      toast.success("Problem created successfully!");
      router.push(`/problems/${problem.slug}`);
    },
    onError: (error) => {
      // This will handle the FORBIDDEN error from the server if user is not admin
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
    
    if (validateForm()) {
      try {
        await createProblem.mutateAsync(formValues);
      } catch (error) {
        // Error will be handled by the onError callback
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

          <Button 
            type="submit" 
            className="w-full"
          >
            Create problem
          </Button>
        </form>
      </div>
    </div>
  );
}
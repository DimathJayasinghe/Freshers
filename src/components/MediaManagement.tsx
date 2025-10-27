"use client";
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Upload, Image as ImageIcon, Trash2, Eye, Save, ChevronLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface MediaItem {
  id: number;
  name: string;
  type: 'banner' | 'sport-cover';
  url: string;
  size: string;
  uploadedAt: string;
}

interface MediaManagementProps {
  onBack: () => void;
}

export function MediaManagement({ onBack }: MediaManagementProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: 1,
      name: 'Main Homepage Banner',
      type: 'banner',
      url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=400&fit=crop',
      size: '245 KB',
      uploadedAt: '2025-01-15'
    },
    {
      id: 2,
      name: 'Cricket Tournament Cover',
      type: 'sport-cover',
      url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop',
      size: '182 KB',
      uploadedAt: '2025-01-14'
    }
  ]);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileUpload = (type: 'banner' | 'sport-cover') => {
    // File upload logic would go here
    toast.success(`${type === 'banner' ? 'Banner' : 'Sport Cover'} uploaded successfully!`);
  };

  const handleDelete = (id: number) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
    toast.success('Media deleted successfully');
  };

  const recommendedSizes = {
    banner: {
      width: 1920,
      height: 600,
      aspectRatio: '16:5',
      maxSize: '2 MB',
      formats: 'JPG, PNG, WebP'
    },
    'sport-cover': {
      width: 1200,
      height: 600,
      aspectRatio: '2:1',
      maxSize: '1 MB',
      formats: 'JPG, PNG, WebP'
    }
  };

  const MediaUploadCard = ({ 
    type, 
    title, 
    description, 
    icon 
  }: { 
    type: 'banner' | 'sport-cover'; 
    title: string; 
    description: string;
    icon: ReactNode;
  }) => (
    <div className="glass-card rounded-2xl border border-white/30 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
        <CardTitle className="text-white flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Recommended Specs */}
        <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="text-gray-900">Recommended Specifications:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Dimensions: {recommendedSizes[type].width} × {recommendedSizes[type].height}px</li>
                <li>• Aspect Ratio: {recommendedSizes[type].aspectRatio}</li>
                <li>• Max File Size: {recommendedSizes[type].maxSize}</li>
                <li>• Formats: {recommendedSizes[type].formats}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-900 mb-2">Click to upload or drag and drop</p>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id={`upload-${type}`}
              onChange={() => handleFileUpload(type)}
            />
            <Label htmlFor={`upload-${type}`}>
              <Button
                type="button"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                onClick={() => document.getElementById(`upload-${type}`)?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </Label>
          </div>
        </div>
      </CardContent>
    </div>
  );

  const MediaGalleryItem = ({ item }: { item: MediaItem }) => (
    <div className="glass-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-video">
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={item.type === 'banner' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'}>
            {item.type === 'banner' ? 'Banner' : 'Sport Cover'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-gray-900 mb-2 truncate">{item.name}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{item.size}</span>
          <span>{item.uploadedAt}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setPreviewImage(item.url)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Button>
        <h2 className="text-gray-900 mb-2">Media Management</h2>
        <p className="text-gray-600">Upload and manage banners and sport cover images</p>
      </div>

      {/* Upload Section */}
      <Tabs defaultValue="upload" className="w-full mb-8">
        <TabsList className="glass-effect shadow-xl rounded-2xl p-2 border border-white/20 mb-8">
          <TabsTrigger value="upload" className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-xl transition-all duration-300">
            <Upload className="w-4 h-4 mr-2" />
            Upload Media
          </TabsTrigger>
          <TabsTrigger value="gallery" className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-xl transition-all duration-300">
            <ImageIcon className="w-4 h-4 mr-2" />
            Media Gallery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MediaUploadCard
              type="banner"
              title="Homepage Banner"
              description="Full-width banner for the homepage hero section"
              icon={<ImageIcon className="w-5 h-5" />}
            />
            
            <MediaUploadCard
              type="sport-cover"
              title="Sport Cover Image"
              description="Cover images for individual sport pages"
              icon={<ImageIcon className="w-5 h-5" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="mt-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-900">
                {mediaItems.length} media file{mediaItems.length !== 1 ? 's' : ''}
              </p>
              <p className="text-gray-600 text-sm">Total storage used: 427 KB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item) => (
              <MediaGalleryItem key={item.id} item={item} />
            ))}
          </div>

          {mediaItems.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center border border-white/30">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 mb-2">No media uploaded yet</p>
              <p className="text-gray-600 text-sm">Upload your first banner or sport cover image to get started</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-6xl w-full">
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setPreviewImage(null)}
              >
                ✕ Close
              </Button>
            </div>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

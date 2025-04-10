import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const PhotoSlideshow = ({ photos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    console.log('Photos received in slideshow:', photos); // Debug log

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === photos.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? photos.length - 1 : prevIndex - 1
        );
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
        console.log('No photos to display');
        return null;
    }

    const getImageUrl = (photo) => {
        if (!photo) {
            console.error('Photo object is null or undefined');
            return '/placeholder-image.jpg';
        }
        
        // For backward compatibility, check both path and filename
        const imagePath = photo.path || photo.filename;
        if (!imagePath) {
            console.error('No valid image path found:', photo);
            return '/placeholder-image.jpg';
        }
        
       return `https://smartappkeys.onrender.com/${imagePath}`;
    };

    const getThumbnailUrl = (photo) => {
        if (!photo) {
            console.error('Photo object is null or undefined');
            return '/placeholder-image.jpg';
        }
        
        // For backward compatibility, check both thumbnailPath and original path
        const thumbnailPath = photo.thumbnailPath || photo.path || photo.filename;
        if (!thumbnailPath) {
            console.error('No valid thumbnail path found:', photo);
            return '/placeholder-image.jpg';
        }
        
        return `https://smartappkeys.onrender.com/${thumbnailPath}`;
    };

    const Slide = ({ isFullscreen }) => {
        const currentPhoto = photos[currentIndex];
        if (!currentPhoto) return null;

        return (
            <div className={`relative ${isFullscreen ? 'fixed inset-0 bg-black z-50' : 'h-96'}`}>
                <img
                    src={getImageUrl(currentPhoto)}
                    alt={`Route photo ${currentIndex + 1}`}
                    className={`
                        ${isFullscreen 
                            ? 'w-full h-full object-contain' 
                            : 'w-full h-full object-cover rounded-lg'}
                    `}
                    onClick={toggleFullscreen}
                    onError={(e) => {
                        console.error('Error loading image:', currentPhoto);
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
                
                {/* Navigation Arrows */}
                {photos.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prevSlide();
                            }}
                            className={`
                                absolute left-4 top-1/2 transform -translate-y-1/2
                                bg-black/50 hover:bg-black/70 text-white
                                p-2 rounded-full transition-colors
                                ${isFullscreen ? 'h-12 w-12' : 'h-8 w-8'}
                            `}
                        >
                            <ChevronLeft className={`${isFullscreen ? 'h-8 w-8' : 'h-4 w-4'}`} />
                        </button>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                nextSlide();
                            }}
                            className={`
                                absolute right-4 top-1/2 transform -translate-y-1/2
                                bg-black/50 hover:bg-black/70 text-white
                                p-2 rounded-full transition-colors
                                ${isFullscreen ? 'h-12 w-12' : 'h-8 w-8'}
                            `}
                        >
                            <ChevronRight className={`${isFullscreen ? 'h-8 w-8' : 'h-4 w-4'}`} />
                        </button>
                    </>
                )}

                {/* Photo Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                    bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {photos.length}
                </div>

                {/* Fullscreen Close Button */}
                {isFullscreen && (
                    <button
                        onClick={toggleFullscreen}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 
                            text-white p-2 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <Slide isFullscreen={isFullscreen} />
            
            {/* Thumbnail Navigation */}
            {photos.length > 1 && (
                <div className="mt-4 grid grid-cols-6 gap-2">
                    {photos.map((photo, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`
                                relative aspect-square overflow-hidden rounded-lg
                                ${currentIndex === index ? 'ring-2 ring-green-500' : ''}
                            `}
                        >
                            <img
                                src={getThumbnailUrl(photo)} // Using thumbnail URL here
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.error('Error loading thumbnail:', photo);
                                    e.target.src = '/placeholder-image.jpg';
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhotoSlideshow;

import React from 'react';
import Photo from './Photo';

const PhotoWall = ({ photos, onUpdateCaption, onRefreshCaption, onDelete, onPhotoMove }) => {
    return (
        <div className="fixed inset-0 z-0 w-full h-full">
            {photos.map((photo) => (
                <Photo
                    key={photo.id}
                    data={photo}
                    isEjecting={false}
                    onDelete={onDelete}
                    onUpdateCaption={onUpdateCaption}
                    onRefreshCaption={onRefreshCaption}
                    style={{
                        left: photo.x,
                        top: photo.y,
                        width: '220px',
                        position: 'absolute',
                    }}
                    onDragEnd={(data, info) => {
                        onPhotoMove(photo.id, photo.x + info.offset.x, photo.y + info.offset.y);
                    }}
                />
            ))}
        </div>
    );
};

export default PhotoWall;

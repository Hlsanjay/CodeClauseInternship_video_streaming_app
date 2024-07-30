import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    const [showUpload, setShowUpload] = useState(false);
    const [showMyVideos, setShowMyVideos] = useState(false);
    const [username, setUsername] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [visibility, setVisibility] = useState('public');
    const [myVideos, setMyVideos] = useState([]);
    const [allVideos, setAllVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            setUsername(parsedUser.username || '');
            fetchVideos(parsedUser.id);
        }
    }, []);

    const fetchVideos = async (userId) => {
        setLoading(true);
        setError('');
        try {
            const responseMyVideos = await axios.get(`http://localhost:8081/my-videos/${userId}`);
            setMyVideos(responseMyVideos.data);

            const responseAllVideos = await axios.get('http://localhost:8081/videos', {
                params: { userId }
            });
            setAllVideos(responseAllVideos.data);
        } catch (err) {
            setError('Failed to fetch videos.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));

        if (user && videoFile) {
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('userId', user.id);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('visibility', visibility);

            setLoading(true);
            setError('');
            try {
                const response = await axios.post('http://localhost:8081/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.success) {
                    setTitle('');
                    setDescription('');
                    setVideoFile(null);
                    setVisibility('public');
                    setShowUpload(false);
                    fetchVideos(user.id);
                } else {
                    setError(response.data.message || 'Upload failed.');
                }
            } catch (err) {
                setError('Error uploading video.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleFileChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const handleVisibilityChange = (e) => {
        setVisibility(e.target.value);
    };

    const handleVideosClick = () => {
        setShowUpload(false);
        setShowMyVideos(true);
    };

    const handleUploadClick = () => {
        setShowUpload(true);
        setShowMyVideos(false);
    };

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="main-dash">
            <div className="dashboard-container">
                <div className="user-info">
                    <div className="user-icon">
                        <i className="fas fa-user"></i>
                    </div>
                    <div className="user-name">{username || 'Loading...'}</div>
                </div>
                <div className="sidebar">
                    <div className="sidebar-item" onClick={handleVideosClick}>Videos</div>
                    <div className="sidebar-item" onClick={handleUploadClick}>Upload Videos</div>
                    <div className="sidebar-item" onClick={handleLogout}>Logout</div>
                </div>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            {showMyVideos && !showUpload && !selectedVideo && (
                <div className="videos-uploaded">
                    <h2>My Videos ({myVideos.length})</h2>
                    {myVideos.length > 0 ? (
                        myVideos.map(video => (
                            <div key={video.id} className="video-item" onClick={() => handleVideoClick(video)}>
                                <h3>{video.title}</h3>
                                <p>Views: {video.views}</p>
                            </div>
                        ))
                    ) : (
                        <p>No videos uploaded yet.</p>
                    )}

                    <h2>All Videos ({allVideos.length})</h2>
                    {allVideos.length > 0 ? (
                        allVideos.map(video => (
                            <div key={video.id} className="video-item" onClick={() => handleVideoClick(video)}>
                                <h3>{video.title}</h3>
                                <p>Views: {video.views}</p>
                            </div>
                        ))
                    ) : (
                        <p>No videos available.</p>
                    )}
                </div>
            )}

{selectedVideo && (
    <div className="video-player">
        <h2>{selectedVideo.title}</h2>
        <video controls>
            <source src={`http://localhost:8081${selectedVideo.video_url}`} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <p>{selectedVideo.description}</p>
        <button onClick={() => setSelectedVideo(null)}>Back to Videos</button>
    </div>
)}

                {showUpload && (
                <form onSubmit={handleUpload} className="upload-form">
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea 
                        placeholder="Description" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    <input 
                        type="file" 
                        accept="video/*"
                        onChange={handleFileChange}
                        required
                    />
                    <div className="visibility-options">
                        <label>
                            <input 
                                type="radio" 
                                value="public" 
                                checked={visibility === 'public'} 
                                onChange={handleVisibilityChange}
                            />
                            Public
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                value="private" 
                                checked={visibility === 'private'} 
                                onChange={handleVisibilityChange}
                            />
                            Private
                        </label>
                    </div>
                    <button type="submit">Upload Video</button>
                </form>
            )}
        </div>
    );
}

export default Dashboard;

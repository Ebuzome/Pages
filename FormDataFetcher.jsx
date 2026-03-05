// FormDataFetcher.jsx
import React, { useState, useEffect } from 'react';

// Firebase configuration 
const firebaseConfig = {
    apiKey: "AIzaSyBrPHXqZvGD6Y9RoXUwarkg5AFjX8t7nJI",
    authDomain: "intake-form-20a68.firebaseapp.com",
    projectId: "intake-form-20a68",
    storageBucket: "intake-form-20a68.firebasestorage.app",
    messagingSenderId: "81594413185",
    appId: "1:81594413185:web:8aad81f850a86517d9dd80",
    measurementId: "G-3ETHQKK152"
};

const FormDataFetcher = ({ children }) => {
    const [data, setData] = useState({
        submissions: [],
        loading: true,
        error: null,
        stats: {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            uniqueIPs: 0
        }
    });

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            try {
                // Dynamically import Firebase
                const firebase = await import('firebase/compat/app');
                await import('firebase/compat/firestore');
                
                // Initialize Firebase
                if (!firebase.default.apps.length) {
                    firebase.default.initializeApp(firebaseConfig);
                }
                
                const db = firebase.default.firestore();
                
                // Fetch submissions
                const snapshot = await db.collection('intakeSubmissions')
                    .orderBy('submittedAt', 'desc')
                    .get();
                
                if (!isMounted) return;
                
                const submissions = [];
                const ipSet = new Set();
                let pending = 0, approved = 0, rejected = 0;
                
                snapshot.forEach(doc => {
                    const submission = {
                        id: doc.id,
                        ...doc.data()
                    };
                    
                    // Format date
                    if (submission.submittedAt?.seconds) {
                        submission.date = new Date(submission.submittedAt.seconds * 1000);
                    }
                    
                    // Count status
                    const status = submission.status || 'pending';
                    if (status === 'pending') pending++;
                    else if (status === 'approved') approved++;
                    else if (status === 'rejected') rejected++;
                    
                    // Track unique IPs
                    if (submission.ipAddress) {
                        ipSet.add(submission.ipAddress);
                    }
                    
                    submissions.push(submission);
                });
                
                setData({
                    submissions,
                    loading: false,
                    error: null,
                    stats: {
                        total: submissions.length,
                        pending,
                        approved,
                        rejected,
                        uniqueIPs: ipSet.size
                    }
                });
                
            } catch (error) {
                console.error('Firebase fetch error:', error);
                if (isMounted) {
                    setData(prev => ({
                        ...prev,
                        loading: false,
                        error: error.message
                    }));
                }
            }
        };
        
        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, []);
  
    const updateStatus = async (submissionId, newStatus) => {
        try {
            const firebase = await import('firebase/compat/app');
            const db = firebase.default.firestore();
            
            await db.collection('intakeSubmissions').doc(submissionId).update({
                status: newStatus,
                processedAt: firebase.default.firestore.FieldValue.serverTimestamp()
            });
            
            setData(prev => ({
                ...prev,
                submissions: prev.submissions.map(sub => 
                    sub.id === submissionId 
                        ? { ...sub, status: newStatus }
                        : sub
                ),
                stats: {
                    ...prev.stats,
                    pending: prev.stats.pending + (newStatus === 'pending' ? 1 : prev.stats.pending - 1),
                    approved: prev.stats.approved + (newStatus === 'approved' ? 1 : 0),
                    rejected: prev.stats.rejected + (newStatus === 'rejected' ? 1 : 0)
                }
            }));
            
            return { success: true };
            
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, error: error.message };
        }
    };

    if (typeof children === 'function') {
        return children({
            ...data,
            updateStatus
        });
    }

    return (
        <div>
            {data.loading && <p>Loading submissions...</p>}
            {data.error && <p>Error: {data.error}</p>}
            {!data.loading && !data.error && (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
        </div>
    );
};

export default FormDataFetcher;

// ParentComponent.jsx
import React, { useState, useEffect } from 'react';
import Homelander from '../components/Homelander';
import Home from './Home';

function MainHomeParents() {
    const [loadingComplete, setLoadingComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingComplete(true);
        }, 5000); // Assuming loading takes 5 seconds, adjust as needed

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            {!loadingComplete ? <Homelander /> : <Home />}
        </div>
    );
}

export default MainHomeParents;
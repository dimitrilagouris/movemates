import { useState, useEffect } from 'react';
import { DatabaseEngine } from '../../engine/db/DatabaseEngine';

export const UserProfile = () => {
    const [name, setName] = useState('User');

    useEffect(() => {
        const loadName = async () => {
            const db = new DatabaseEngine();
            const settings = await db.loadSettings();
            if (settings?.userName) {
                setName(settings.userName);
            }
        };
        loadName();
    }, []);

    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="user-profile">
            <div className="user-profile__avatar">
                {initial}
            </div>
            <div className="user-profile__info">
                <span className="user-profile__name">{name}</span>
            </div>
        </div>
    );
};
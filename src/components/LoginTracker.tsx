'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { logLogin } from '@/app/actions/user';

export default function LoginTracker() {
    const { user, isLoaded } = useUser();
    const logged = useRef(false);

    useEffect(() => {
        if (isLoaded && user && !logged.current) {
            logged.current = true;
            logLogin(user.id);
        }
    }, [user, isLoaded]);

    return null;
}

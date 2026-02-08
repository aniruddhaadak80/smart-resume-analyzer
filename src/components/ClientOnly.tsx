'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Wrapper component that only renders children on the client side.
 * This prevents hydration mismatches caused by browser extensions like Dark Reader
 * that modify the DOM before React hydrates.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

export default ClientOnly;

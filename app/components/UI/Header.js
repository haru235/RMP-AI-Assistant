'use client';

import Link from "next/link";
import Image from 'next/image'

export default function Header() {
    return (

        <header className="flex items-center justify-between px-10 py-5">
            <div className="flex items-center gap-20">
                <div>
                    <Image width={100} height={100} src="images/Block.svg" />
                </div>
                <nav>
                    <ul className="flex items-center gap-5">
                        <Link href="/chatbotpage">ProfChat</Link>
                        <Link href="">Pricing</Link>
                        <Link href="">FAQ</Link>
                        <Link href="">Contact</Link>
                    </ul>
                </nav>
            </div>
            <div className="flex items-center gap-5">
                <Link className="px-10 py-2 border-2 border-black rounded" href="">Login</Link>
                <Link className="px-10 py-2 border-2 border-black bg-black text-white rounded" href="">Sign Up</Link>
            </div>

        </header>)
}
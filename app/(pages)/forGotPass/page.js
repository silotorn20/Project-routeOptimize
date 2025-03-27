//ForGotPassword Page
'use client'
import style from './forgotpass.module.css';
import styles from '../../css/login.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Form from 'next/form'
import Modal from "../../modals/Modal";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import app from "../../../config";
import showAlert from '@/app/modals/ShowAlert';


export default function ForgotPassword() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const auth = getAuth(app);
    const [user, setUser] = useState(null);
    const [emailForPasswordReset, setEmailForPasswordReset] = useState("");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handlePasswordResetRequest = async (e) => {
        e.preventDefault();
        console.log("email");

        if (!emailForPasswordReset) {
            alert("Please enter your email address.");
            console.log(emailForPasswordReset);

            return;
        }

        try {
            await sendPasswordResetEmail(auth, emailForPasswordReset);
            // alert("Password reset email sent! Please check your inbox.");
            // openModal(true)
            showAlert('Reset successfully!')
            setTimeout(() => {
                router.push("/");
            },2000)

            // setShowPopupReset(false); // Close the modal after sending the reset email
        } catch (error) {
            alert("Error sending password reset email: " + error.message);
        }

    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 lg:px-6">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className={`${style.title}`}>
                    Forgot password
                </h2>
                <div className={style.p}>
                    No worries, we'll send you reset instructions
                </div>
            </div>
            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
                <Form onSubmit={handlePasswordResetRequest} className="space-y-6">
                    <div className={style.text_email}>
                        <label htmlFor="email">
                            Email
                        </label>
                        <div className={style.input_placeholder_email}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={emailForPasswordReset}
                                onChange={(e) => setEmailForPasswordReset(e.target.value)}
                                required
                                autoComplete="email"
                                className={style.input_email}
                            />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className={style.btn}>Submit</button>
                    </div>
                </Form>
                <div className='mt-48'>
                    <Link href="/" className={styles.link}>
                        <div className='flex'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            <div className='ml-2'>
                                Back to log in
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
            {/* <Modal isOpen={isModalOpen} onClose={closeModal}>
            </Modal> */}
        </div>
    );
}
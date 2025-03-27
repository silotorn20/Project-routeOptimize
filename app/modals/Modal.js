import popup from '../css/success.module.css';
import { useRouter } from 'next/navigation';

const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10'>
            <main className={`${popup.card}`}>
                <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4ade80" className={popup.icon}>
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 className={popup.title}>
                            Successfully reset
                        </h2>
                        <div className={popup.p}>
                            Password reset email sent! Please check your inbox.
                        </div>

                        <button type="button" onClick={onClose} className={`${popup.btn} mt-5`}>Back</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Modal;

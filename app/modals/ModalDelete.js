// css
import styles from '../css/delete.module.css';

const ModalDelete = ({ isOpen, onClose, onConfirm, type }) => {
    if (!isOpen) return null;
    // const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <main className={`${styles.card}`}>
                <div className="flex flex-1 flex-col justify-center relative px-6 lg:px-8">

                    <button onClick={onClose} tabIndex="-1" type="button" className="absolute top-2 right-2 rtl:right-auto rtl:left-2">
                        <svg title="Close" tabIndex="-1" className={styles.close}
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"></path>
                        </svg>
                        <span className="sr-only">
                            Close
                        </span>
                    </button>

                    <div className="space-y-2 p-2 pt-5">
                        <div className="p-4 space-y-2">
                            <h2 className={styles.title}>
                                Delete
                            </h2>

                            <p className={styles.p}>
                                Are you sure you would to do this?
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">

                        <div className="px-6 py-4">
                            {type === "deleteStudent" ? (
                                <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(0,1fr))]">

                                    <button type="button" onClick={onConfirm}
                                        className={`${styles.btn_delete} inline-flex items-center justify-center`}>

                                        <span className="flex items-center gap-1">
                                            <span className={styles.text_delete}>
                                                Delete
                                            </span>
                                        </span>

                                    </button>

                                    <button onClick={onClose} type="button"
                                        className={`${styles.btn_cancel} inline-flex items-center justify-center`}>
                                        <span className="flex items-center gap-1">
                                            <span className={styles.text_cancel}>
                                                Cancel
                                            </span>
                                        </span>
                                    </button>

                                </div>
                            ) : type === "deleteAll" ? (
                                <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(0,1fr))]">

                                    <button type="button" onClick={onConfirm}
                                        className={`${styles.btn_delete} inline-flex items-center justify-center`}>

                                        <span className="flex items-center gap-1">
                                            <span className={styles.text_delete}>
                                                Delete
                                            </span>
                                        </span>

                                    </button>

                                    <button onClick={onClose} type="button"
                                        className={`${styles.btn_cancel} inline-flex items-center justify-center`}>
                                        <span className="flex items-center gap-1">
                                            <span className={styles.text_cancel}>
                                                Cancel
                                            </span>
                                        </span>
                                    </button>

                                </div>
                            ) : type === "deleteHistory" ? (
                                <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(0,1fr))]">

                                    <button type="button" onClick={onConfirm}
                                        className={`${styles.btn_delete} inline-flex items-center justify-center`}>

                                        <span className="flex items-center gap-1">
                                            <span className={styles.text_delete}>
                                                Delete
                                            </span>
                                        </span>

                                    </button>

                                    <button onClick={onClose} type="button"
                                        className={`${styles.btn_cancel} inline-flex items-center justify-center`}>
                                        <span className="flex items-center gap-1">
                                            <span className={styles.text_cancel}>
                                                Cancel
                                            </span>
                                        </span>
                                    </button>

                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModalDelete;
import { useState, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { useId } from 'react'
import Image
 from 'next/image'
export default function NetworkDialog(){
    let [isOpen, setIsOpen] = useState(true)

    const ipId = useId;
    const portId = useId;

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    
    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(`ip: ${ip}, port: ${port}`);

        closeModal()
    };

    return(
        <div className=' w-5/6 h-64'>
            <button onClick={openModal}>
                        <Image src="/settings-cog.svg" alt="Settings cog" width={44} height={44} />
            </button>

            <Dialog as='div' open={isOpen} onClose={() => setIsOpen(false)}>
                <Dialog.Panel>
                    <Dialog.Title>
                        IP and Port Settings
                    </Dialog.Title>
                    <form onSubmit={handleSubmit}>
                    <div>
                    <label htmlFor={ipId}>
                            Username: <input name="ip" type="text" id={ipId} 
                              placeholder="192.000.000.1"/>
                        </label>
                        
                        <label htmlFor={portId} className="">
                            Password: <input name="port" type="text" id={portId}
                             placeholder="3000"/>
                        </label>
                    </div>
                    <div>
                        <button type='submit'>
                            Submit
                        </button>
                    
                    </div>
                    </form>

                    </Dialog.Panel>
            </Dialog>
        </div>
    )
}
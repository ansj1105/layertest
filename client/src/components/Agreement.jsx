// 📁 src/components/Agreement.jsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X as CloseIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Agreement({ isOpen, onClose, type }) {
  const { t } = useTranslation();
  const titleKey   = type === 'terms'   ? 'agreement.terms.title'   : 'agreement.privacy.title';
  const contentKey = type === 'terms'   ? 'agreement.terms.content' : 'agreement.privacy.content';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center bg-black/50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"  leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#2c1f0f] text-yellow-100 rounded-lg shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title as="h2" className="text-xl font-semibold">
                  {t(titleKey)}
                </Dialog.Title>
                <button onClick={onClose}>
                  <CloseIcon size={20} className="text-yellow-300 hover:text-white"/>
                </button>
              </div>
              <div
                className="prose prose-invert max-w-none space-y-4 overflow-y-auto"
                style={{ maxHeight: '70vh', whiteSpace: 'pre-line' }}
              >
                {t(contentKey)}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

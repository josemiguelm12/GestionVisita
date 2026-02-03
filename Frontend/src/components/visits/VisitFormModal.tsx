import React from 'react';
import Modal from '../common/Modal';
import VisitForm from './VisitForm';
import type { CreateVisitRequest } from '../../types/visit.types';

interface VisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVisitRequest) => Promise<void>;
}

const VisitFormModal: React.FC<VisitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Visita"
      size="xl"
    >
      <VisitForm onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
};

export default VisitFormModal;

import React from 'react';
import Modal from '../common/Modal';
import VisitorForm from './VisitorForm';
import type { Visitor, CreateVisitorRequest } from '../../types/visitor.types';

interface VisitorFormModalProps {
  isOpen: boolean;
  visitor?: Visitor | null;
  onClose: () => void;
  onSubmit: (data: CreateVisitorRequest) => Promise<void>;
}

const VisitorFormModal: React.FC<VisitorFormModalProps> = ({
  isOpen,
  visitor,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={visitor ? 'Editar Visitante' : 'Nuevo Visitante'}
      size="lg"
    >
      <VisitorForm
        visitor={visitor}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default VisitorFormModal;

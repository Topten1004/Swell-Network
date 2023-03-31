import * as yup from 'yup';

// eslint-disable-next-line import/prefer-default-export
export const BecomeANodeOperatorSchema = yup.object().shape({
  location: yup.string().required().label('Location'),
  cpu: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .min(1)
    .required()
    .label('CPU'),
  ram: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .min(1)
    .required()
    .label('RAM'),
  network: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .min(1)
    .required()
    .label('Network bandwidth'),
  storage: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .min(1)
    .required()
    .label('Storage'),
  executionLayerClients: yup
    .string()
    .nullable()
    .label('Execution layer client')
    .oneOf(['GETH', 'BESU', 'NETHERMIND', 'ERIGON', null]),
  consensusLayerClients: yup
    .string()
    .nullable()
    .label('Consensus layer client')
    .oneOf(['LIGHTHOUSE', 'NIMBUS', 'TEKU', 'PRYSM', 'LODESTAR', null]),
  nodes: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .min(1)
    .required()
    .label('Number of nodes'),
  category: yup.string().required().label('Type').oneOf(['INDIVIDUAL', 'INSTITUTIONAL']),
  name: yup.string().required().label('Name'),
  yearsOfExperience: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required()
    .label('Years of experience'),
  email: yup.string().label('Email').email('Invalid Email Address').nullable(true),
  website: yup.string().label('Website').nullable(true),
  social: yup.string().label('Socials').nullable(true),
  description: yup.string().required().label('Description'),
  rate: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .min(0)
    .required()
    .label('Commission Rate'),
  logo: yup.string().label('Logo').nullable(true),
});

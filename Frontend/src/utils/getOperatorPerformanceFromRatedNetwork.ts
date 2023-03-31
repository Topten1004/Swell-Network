import axios from 'axios';

type ClientPercentage = {
  name: string;
  value: number;
};

type NodeOperatorPerformanceInfo = {
  performanceRating: number;
  ratingPercentile: number;
  clientDiversity: Array<ClientPercentage>;
  error: string | null;
};

const getOperatorPerformanceFromRatedNetwork = async (nodeOperatorName: any): Promise<NodeOperatorPerformanceInfo> => {
  try {
    const operatorResponse = await axios.get(`https://api.rated.network/v0/eth/operators/Blockscape`);
    const operatorsResponse = await axios.get(
      `https://api.rated.network/v0/eth/operators?window=all&idType=entity&parentEntity=${operatorResponse.data.parentEntity}`
    );
    const operators = operatorsResponse.data.data;
    const currentOperator = operators.find((operator: any) => operator.id === 'Blockscape');
    const clientDiversities = currentOperator.clientPercentages.map((clientPercentage: any) => ({
      name: clientPercentage.client,
      value: clientPercentage.percentage,
    }));

    return {
      performanceRating: currentOperator.avgCorrectness * 100,
      ratingPercentile: currentOperator.avgValidatorEffectiveness,
      clientDiversity: clientDiversities,
      error: null,
    };
  } catch (error: any) {
    return {
      performanceRating: 0,
      ratingPercentile: 0,
      clientDiversity: [],
      error: error.message,
    };
  }
};

export default getOperatorPerformanceFromRatedNetwork;

import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';

export const useContentPolicy = () => {
  return useSelector((state: RootState) => state.contentPolicy);
};

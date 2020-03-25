import { Response, Request } from 'express';

import { HomeService } from '../services/home.service';
import { dataError, dataSuccess } from '../config/responseCustom';

export class HomeController {
    /**
     * This is function test api 
     */
    static index = async (req: Request, res: Response): Promise<any> => {
        try {
            const homeService = new HomeService();
            const result = await homeService.getHello();
            return res.send(dataSuccess('Ok', result));
        } catch (error) {
            return res.send(dataError(error.message || 'Bad request', null));
        }
    };
}
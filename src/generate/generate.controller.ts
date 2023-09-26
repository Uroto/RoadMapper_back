import { Controller, Get } from '@nestjs/common';
import { GenerateService } from './generate.service';

@Controller('generate')
export class GenerateController {
    constructor(private generateService: GenerateService){}

    @Get()
    gptRes(){
        return this.generateService.gptRes();
    }
}

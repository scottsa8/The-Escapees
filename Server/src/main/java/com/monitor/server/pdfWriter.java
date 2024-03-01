package com.monitor.server;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Path;
import java.sql.*;
import java.text.DateFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.CategoryLabelPosition;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.labels.CategoryItemLabelGenerator;
import org.jfree.chart.labels.ItemLabelAnchor;
import org.jfree.chart.labels.ItemLabelPosition;
import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.plot.XYPlot;
import org.jfree.chart.renderer.category.CategoryItemRenderer;
import org.jfree.chart.renderer.category.LineAndShapeRenderer;
import org.jfree.chart.renderer.xy.XYItemRenderer;
import org.jfree.chart.renderer.xy.XYLineAndShapeRenderer;
import org.jfree.chart.text.TextBlockAnchor;
import org.jfree.chart.ui.HorizontalAlignment;
import org.jfree.chart.ui.RectangleAnchor;
import org.jfree.chart.ui.TextAnchor;
import org.jfree.data.category.CategoryDataset;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.Dataset;
import org.jfree.data.time.*;
import org.jfree.data.xy.*;

import javax.print.Doc;


public class pdfWriter implements Runnable {
    private static String FILE = "src/main/resources/report.pdf";
    private static Font catFont = new Font(Font.FontFamily.TIMES_ROMAN, 18,
            Font.BOLD);
    private static Font redFont = new Font(Font.FontFamily.TIMES_ROMAN, 12,
            Font.NORMAL, BaseColor.RED);
    private static Font subFont = new Font(Font.FontFamily.TIMES_ROMAN, 16,
            Font.BOLD);
    private static Font smallBold = new Font(Font.FontFamily.TIMES_ROMAN, 12,
            Font.BOLD);
    private static Connection con;
    private static PdfWriter writer;
    private static PdfReader reader;
    private static Date day;
    public pdfWriter(Connection con, Date day) {
        this.con = con;
        this.day = day;
    }
    private ArrayList<String> roomNames = new ArrayList<>();
    private ArrayList<Integer> roomNumbers = new ArrayList<>();
    private ArrayList<Integer> order = new ArrayList<>();

    public void run() {
        System.out.println(pdfWriter.class.getResource("/"));
        roomNames.add("ignore");
        roomNumbers.add(-1);
        try {
            Document document = new Document();
            writer = PdfWriter.getInstance(document, new FileOutputStream(FILE));
            document.open();
            writer.setLinearPageMode();
            addMetaData(document);
            addContent(document);
            addRooms(document);

            //add title page last, then add it to the start
            //required for adding hyperlinks
            addTitlePage(document);
            int total = writer.getPageNumber()-1;
            order.add(0,total);
            for(int i=1;i<total;i++){
                order.add(i,i);
            }
            int[] arr = order.stream().mapToInt(Integer::intValue).toArray();
            System.out.println(Arrays.toString(arr));
            writer.reorderPages(arr);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    //testing purposes only//
//    public static void main(String[] args){
//        System.out.println(pdfWriter.class.getResource("/"));
//        try {
//            Document document = new Document();
//            writer = PdfWriter.getInstance(document, new FileOutputStream(FILE));
//            document.open();
//            addMetaData(document);
//            addTitlePage(document);
//            addContent(document);
//            document.close();
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }

    // iText allows to add metadata to the PDF which can be viewed in your Adobe
    // Reader
    // under File -> Properties
    private static void addMetaData(Document document) {
        document.addTitle("Daily report");
        document.addSubject("test");
        document.addKeywords("Java, PDF, iText");
        document.addAuthor("Lars Vogel");
        document.addCreator("Lars Vogel");
    }

    private void addTitlePage(Document document) throws DocumentException {
        //main page to add content
        Paragraph main = new Paragraph();
        addEmptyLine(main, 1);
        //add tilte
        Paragraph title = new Paragraph("Click a heading to view it!", catFont);
        title.setAlignment(Element.ALIGN_CENTER);
        main.add(title);
        addEmptyLine(main, 1);

        //setup hyperlinks
        PdfAction page2 = PdfAction.gotoLocalPage(1,new PdfDestination(1),writer);
        Chunk peak = new Chunk("Peak over the last 24 hours");
        peak.setAction(page2);
        main.add(peak);

        main.add(addHyperLinks());
        document.add(main);
        document.newPage();
    }
    private void addRooms(Document document){
        try {
            PreparedStatement selectStatement = con.prepareStatement(
                    "SELECT room_name FROM rooms WHERE room_name<>'gate1' AND room_name<>'gate2' "
            );
            ResultSet rs = selectStatement.executeQuery();
            while(rs.next()){
                addRoomPage(document,rs.getString("room_name"));
                roomNames.add(rs.getString("room_name"));
                roomNumbers.add(writer.getCurrentPageNumber()-1);
            }
        }catch (Exception e){
            e.printStackTrace();
        }
    }
    private Paragraph addHyperLinks() {
        Paragraph main = new Paragraph();
        for(int i =1;i< roomNumbers.size();i++){
            PdfAction page = PdfAction.gotoLocalPage(roomNumbers.get(i),new PdfDestination(roomNumbers.get(i)),writer);
            Chunk chunk = new Chunk(roomNames.get(i));
            chunk.setAction(page);
            main.add(chunk);
            addEmptyLine(main,1);
        }
        return main;
    }
    private Image createGraph(String type,boolean peak,String roomName) {
        JFreeChart chart = null;
        try {
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            TimePeriodValuesCollection xyDataset = new TimePeriodValuesCollection();
            TimePeriodValues xySeries = new TimePeriodValues(type);
            PreparedStatement selectStatement;
            if (peak) { //get the peak values for the type of graph wanted
                selectStatement = con.prepareStatement(
                        "SELECT ANY_VALUE(timestamp) as time,room_name,MAX(" + type + ") as value FROM roomEnvironment env " +
                                "JOIN rooms r ON env.room_id=r.room_id WHERE timestamp >= now() - INTERVAL 1 DAY GROUP BY room_name "
                );
            } else { //if not a peak graph
                selectStatement = con.prepareStatement(
                        "SELECT ANY_VALUE(timestamp) as time,room_name," + type + " as value FROM roomEnvironment env " +
                                "JOIN rooms r ON env.room_id=r.room_id WHERE r.room_name= \"" + roomName + "\""
                );
            }
            ResultSet rs = selectStatement.executeQuery();
            while (rs.next()) {
                //get all the values and format time
                int value = (int) rs.getDouble("value");
                Time t = rs.getTime("time");
                Date d = rs.getDate("time");

                String time = new SimpleDateFormat("HH:mm").format(t);
                String name = rs.getString("room_name") + "\n" + time;
                //add to dataset for the graph
                if(peak){
                    dataset.addValue(value, name, name);
                }else{
                    if(d.getTime()==day.getTime()){
                        xySeries.add(new Second(t),value);
                    }
                }
            }
            xyDataset.addSeries(xySeries);
            //create chart and size title//
            if(peak) {
                if (type.equals("Temperature")) {
                    chart = ChartFactory.createStackedBarChart("Peak Temperature", "", "Temperature °C", dataset, PlotOrientation.VERTICAL, false, false, false);
                } else if (type.equals("Noise_level")) {
                    chart = ChartFactory.createStackedBarChart("Peak Noise Level", "", "Noise Level", dataset, PlotOrientation.VERTICAL, false, false, false);
                } else if (type.equals("Light_level")) {
                    chart = ChartFactory.createStackedBarChart("Peak Light level", "", "Light Level", dataset, PlotOrientation.VERTICAL, false, false, false);
                }
                chart.getTitle().setHorizontalAlignment(HorizontalAlignment.CENTER);
                chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 15));
                //if more than 4 datasets then change text to be verticle and size correctly
                if(dataset.getRowCount()>4){
                    chart.getCategoryPlot().getDomainAxis().setCategoryLabelPositions(CategoryLabelPositions.DOWN_90);
                    chart.getCategoryPlot().getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
                    chart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelLines(3);
                }else{//otherwise size correctly horizontal
                    chart.getCategoryPlot().getDomainAxis().setCategoryLabelPositions(CategoryLabelPositions.STANDARD);
                    chart.getCategoryPlot().getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 11));
                    chart.getCategoryPlot().getDomainAxis().setMaximumCategoryLabelLines(2);
                }
                //setup text inside of bar chart
                CategoryPlot plot = chart.getCategoryPlot();
                CategoryItemRenderer renderer = plot.getRenderer();
                CategoryItemLabelGenerator generator = new StandardCategoryItemLabelGenerator("{2}", NumberFormat.getInstance());
                //size and format correctly
                renderer.setDefaultItemLabelGenerator(generator);
                renderer.setDefaultItemLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 12));
                renderer.setDefaultItemLabelsVisible(true);
                renderer.setDefaultPositiveItemLabelPosition(new ItemLabelPosition(ItemLabelAnchor.CENTER, TextAnchor.CENTER, TextAnchor.CENTER, - 0 / 2));
            }else {
                if (type.equals("Temperature")) {
                    chart = ChartFactory.createTimeSeriesChart("Temperature", "", "Temperature °C", xyDataset, false, false, false);
                   // chart = chart.getXYPlot().getChart();
                } else if (type.equals("Noise_level")) {
                    chart = ChartFactory.createTimeSeriesChart("Noise Level", "", "Noise Level", xyDataset, false, false, false);
                    //chart = chart.getXYPlot().getChart();
                } else if (type.equals("Light_level")) {
                    chart = ChartFactory.createTimeSeriesChart("Light level", "", "Light Level", xyDataset, false, false, false);
                   // chart = chart.getXYPlot().getChart();

                }
                assert chart != null;
                ((NumberAxis)chart.getXYPlot().getRangeAxis()).setAutoRangeIncludesZero(true);
                XYLineAndShapeRenderer renderer = (XYLineAndShapeRenderer) chart.getXYPlot().getRenderer();
                renderer.setDefaultShape( new Ellipse2D.Double(-1d, -1d, 3d, 3d));
                renderer.setSeriesShape(0, new Ellipse2D.Double(-1d, -1d, 3d, 3d));
                renderer.setDefaultShapesVisible(true);
            }
            //create image
            BufferedImage bufferedImage = chart.createBufferedImage(500,200);
            //return created image
            return Image.getInstance(writer,bufferedImage,1.0f);
    }catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }
    private void addRoomPage(Document document,String room) throws DocumentException{
        Paragraph graphs = new Paragraph();

        Paragraph title = new Paragraph(room, catFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        addEmptyLine(graphs, 1);

        graphs.add(createGraph("Temperature",false,room));
        graphs.add(createGraph("Noise_level",false,room));
        graphs.add(createGraph("Light_level",false,room));
        document.add(graphs);
        document.newPage();
        document.add(createLocation(room));

        document.newPage();
    }
    private void addContent(Document document) throws DocumentException {
        Paragraph main = new Paragraph();

        Paragraph subEnv = new Paragraph("Environmental recap", catFont);
        subEnv.setAlignment(Element.ALIGN_CENTER);
        main.add(subEnv);

        addEmptyLine(main, 1);
        //add peak graphs for each room
        main.add(createGraph("Temperature",true,""));
        main.add(createGraph("Noise_level",true,""));
        main.add(createGraph("Light_level",true,""));
        document.add(main);

        document.newPage();
        //add location subheading

        /*
          addEmptyLine(main,10);
        Paragraph subLoc = new Paragraph("Location recap", catFont);
        subLoc.setAlignment(Element.ALIGN_RIGHT);
        main.add(subLoc);
        addEmptyLine(main, 1);

        // Second parameter is the number of the chapter
        Chapter catPart = new Chapter(tilte, 1);
        catPart.setNumberDepth(0);
        Section subCatPart = catPart.addSection(new Paragraph(),0);
        // add a table
        createTable(subCatPart);

        // now add all this to the document
        document.add(catPart);

        // now add all this to the document
        document.add(catPart);*/

    }

    private static Paragraph createLocation(String roomName){
        Paragraph main = new Paragraph();

        Paragraph title = new Paragraph("Location History", catFont);
        title.setAlignment(Element.ALIGN_CENTER);
        main.add(title);

        addEmptyLine(main,1);

        PdfPTable table = new PdfPTable(2);
        table.getDefaultCell();

        PdfPCell username = new PdfPCell(new Phrase("Username"));
        username.setHorizontalAlignment(Element.ALIGN_CENTER);
        username.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(username);

        PdfPCell time = new PdfPCell(new Phrase("Entry Time"));
        time.setHorizontalAlignment(Element.ALIGN_CENTER);
        time.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(time);

        table.setHeaderRows(1);

        PreparedStatement selectStatement = null;
        ResultSet rs = null;
        try{
        selectStatement = con.prepareStatement(
                "SELECT u.username, r.room_name, ro.entry_timestamp " +
                        "FROM users u "+
                        "JOIN roomoccupants ro ON u.user_id = ro.user_id " +
                        "JOIN rooms r ON ro.room_id = r.room_id "+
                        "WHERE r.room_name = \"" +roomName+"\""
        );
        rs = selectStatement.executeQuery();
            String prevName="";
            if(rs.next()){
                table.getDefaultCell().setBorderWidth(2);
                while(rs.next()) {
                    String name = rs.getString("username");
                    Timestamp t = rs.getTimestamp("entry_timestamp");
                    if(name.equals(prevName)){
                        table.addCell("");
                        table.addCell(t.toString());
                    }else{
                        table.addCell(name);
                        table.addCell(t.toString());
                    }
                    prevName=name;
                }
                table.getDefaultCell().setBorderWidth(0);
            }else{
                table.addCell("");
                table.addCell("");
            }
        }catch (Exception e){e.printStackTrace();}

       main.add(table);
      return main;
    }
    private static void addEmptyLine(Paragraph paragraph, int number) {
        for (int i = 0; i < number; i++) {
            paragraph.add(new Paragraph(" "));
        }
    }
}